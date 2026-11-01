import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { getApplicationById, reviewApplication } from '@/lib/membership/repository';
import { sendMembershipRejectedEmail } from '@/lib/email/resend';
import { admitApplicationToMembership } from '@/lib/membership/admit';
import type { ReviewApplicationInput } from '@/lib/membership/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const permCheck = await checkUserPermission('membership.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }
    const reviewerId = permCheck.userId;

    const { id } = await params;
    const body: ReviewApplicationInput = await request.json();

    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'approved' || application.status === 'rejected') {
      return NextResponse.json({ error: 'Application has already been processed' }, { status: 400 });
    }

    if (body.status === 'approved') {
      const result = await admitApplicationToMembership({
        applicationId: id,
        reviewerId,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
      });

      return NextResponse.json({
        success: true,
        message: 'Application approved and account created',
        accountId: result.accountId,
        emailSent: result.emailSent,
        emailError: result.emailError,
        credentials: result.credentials,
      });
    }

    await reviewApplication(id, body, reviewerId);
    const { prisma } = await import('@/lib/prisma');
    await prisma.membershipApplication.update({
      where: { id },
      data: { pipelineStage: 'rejected' },
    });

    try {
      await sendMembershipRejectedEmail(application.email, application.firstName);
    } catch (emailErr) {
      console.error('Rejection email failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Application rejected',
    });
  } catch (error: unknown) {
    console.error('Error reviewing application:', error);
    const err = error as { errors?: Array<{ message?: string }>; message?: string };
    if (err.errors) {
      return NextResponse.json(
        { error: err.errors[0]?.message || 'Clerk error' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err.message || 'Failed to review application' },
      { status: 500 },
    );
  }
}
