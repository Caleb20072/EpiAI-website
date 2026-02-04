import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cancelRegistration } from '@/lib/events/repository';

// DELETE /api/events/[id]/cancel - Cancel registration
export async function DELETE(
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

    const result = await cancelRegistration(id, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}
