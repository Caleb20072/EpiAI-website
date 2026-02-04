import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { Resource } from '@/lib/resources/models';

// POST /api/resources/[id]/view - Increment view count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();
    await Resource.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
