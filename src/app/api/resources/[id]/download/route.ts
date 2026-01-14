import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { Resource } from '@/lib/resources/models';

// POST /api/resources/[id]/download - Increment download count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectToDatabase();
    await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error incrementing download count:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to increment download count' },
      { status: 500 }
    );
  }
}
