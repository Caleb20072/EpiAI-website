import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getRepliesByThreadId,
  createReply,
  updateReply,
  deleteReply,
} from '@/lib/forum/repository';
import type { CreateReplyInput } from '@/lib/forum/types';

// GET /api/forum/replies?threadId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'Missing threadId' },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await getRepliesByThreadId(threadId, { page, limit });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

// POST /api/forum/replies - Create reply
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateReplyInput & { threadId: string } = await request.json();

    if (!body.threadId || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user name from Clerk
    const authorName = `User_${userId.slice(0, 8)}`;

    const reply = await createReply(body, body.threadId, userId, authorName);

    return NextResponse.json(reply, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reply' },
      { status: 500 }
    );
  }
}

// PATCH /api/forum/replies - Update reply
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { replyId, content } = body;

    if (!replyId || !content) {
      return NextResponse.json(
        { error: 'Missing replyId or content' },
        { status: 400 }
      );
    }

    const reply = await updateReply(replyId, content);

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reply);
  } catch (error: any) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reply' },
      { status: 500 }
    );
  }
}

// DELETE /api/forum/replies?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get('id');

    if (!replyId) {
      return NextResponse.json(
        { error: 'Missing reply id' },
        { status: 400 }
      );
    }

    // In a real app, check if user is admin or reply author
    const success = await deleteReply(replyId);

    if (!success) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reply' },
      { status: 500 }
    );
  }
}
