import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getApplicationById, reviewApplication } from '@/lib/membership/repository';
import { sendWelcomeEmail } from '@/lib/email/resend';
import type { ReviewApplicationInput } from '@/lib/membership/types';

// Configuration du mot de passe par défaut
const DEFAULT_PASSWORD = process.env.DEFAULT_MEMBER_PASSWORD || 'EpiAI2025!';

// POST /api/membership/[id]/approve - Approuver une candidature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: reviewerId } = await auth();

    if (!reviewerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a la permission d'approuver
    // President (9), Admin General (8), ou Chef Pole (7) peuvent approve
    const { userId } = await auth();
    // Note: La vérification de rôle se fait via PermissionGate dans le frontend
    // Ici on fait confiance au middleware Clerk

    const { id } = await params;
    const body: ReviewApplicationInput = await request.json();

    // Récupérer la candidature
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    if (body.status === 'approved') {
      console.log('[Approve API] Creating Clerk account for:', application.email);

      // Créer le compte Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.createUser({
        emailAddress: [application.email],
        password: DEFAULT_PASSWORD,
        firstName: application.firstName,
        lastName: application.lastName,
        skipPasswordChecks: true,
        publicMetadata: {
          roleId: 1, // nouveau_membre par défaut
          role: 'nouveau_membre',
          approvedAt: new Date().toISOString(),
          mustResetPassword: true,
        },
      });

      console.log('[Approve API] Clerk account created:', clerkUser.id);
      console.log('[Approve API] Sending welcome email to:', application.email);

      // Envoyer l'email de bienvenu
      let emailSentSuccessfully = false;
      try {
        const emailResult = await sendWelcomeEmail({
          email: application.email,
          firstName: application.firstName,
          password: DEFAULT_PASSWORD,
        });
        console.log('[Approve API] Email sent successfully:', emailResult);
        emailSentSuccessfully = true;
      } catch (emailError) {
        console.error('[Approve API] Failed to send welcome email:', emailError);
        console.error('[Approve API] Email error details:', JSON.stringify(emailError, null, 2));
        // Ne pas bloquer l'approbation si l'email échoue
      }

      // Mettre à jour le statut
      await reviewApplication(id, body, reviewerId);

      console.log('[Approve API] Application approved successfully');

      return NextResponse.json({
        success: true,
        message: 'Application approved and account created',
        accountId: clerkUser.id,
        emailSent: emailSentSuccessfully,
        credentials: emailSentSuccessfully ? null : {
          email: application.email,
          password: DEFAULT_PASSWORD,
          note: 'Email failed to send. User must use these credentials to log in.',
        },
      });
    } else {
      // Rejeter la candidature
      await reviewApplication(id, body, reviewerId);

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
      });
    }
  } catch (error: any) {
    console.error('Error reviewing application:', error);

    // Handle Clerk errors
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Clerk error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to review application' },
      { status: 500 }
    );
  }
}
