import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { registerForActivity, unregisterFromActivity } from '@/lib/activities/repository';

// POST /api/activities/[id]/register - S'inscrire à une activité
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch real user data from Clerk (not sessionClaims which may be missing fullName/email)
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
      || clerkUser.username
      || `User_${userId.slice(5, 13)}`;
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@unknown.com`;

    const result = await registerForActivity(id, userId, userName, userEmail);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error registering for activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id]/register - Se désinscrire
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await unregisterFromActivity(id, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error unregistering:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unregister' },
      { status: 500 }
    );
  }
}
