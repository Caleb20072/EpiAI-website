import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { registerForEvent } from '@/lib/events/repository';

// POST /api/events/[id]/register - Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user info from Clerk
    const authData = await auth();
    const userName = (authData.sessionClaims?.fullName as string | undefined) || `User_${userId.slice(0, 8)}`;
    const userEmail = (authData.sessionClaims?.email as string | undefined) || `${userId}@example.com`;

    const result = await registerForEvent(
      id,
      userId,
      userName,
      userEmail
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to register' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, event: result.event });
  } catch (error: any) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register for event' },
      { status: 500 }
    );
  }
}
