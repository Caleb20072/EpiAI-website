import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { clerkClient } from '@clerk/nextjs/server';
import { registerForActivity } from '@/lib/activities/repository';

// POST /api/activities/[id]/force-register - Inscrire de force un membre (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('attendance.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Always fetch real user data from Clerk — never trust client-provided names/emails
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
      || clerkUser.username
      || `User_${userId.slice(5, 13)}`;
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@unknown.com`;

    const result = await registerForActivity(
      id,
      userId,
      userName,
      userEmail,
      permCheck.userId // forcedBy = admin
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error force registering:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to force register' },
      { status: 500 }
    );
  }
}
