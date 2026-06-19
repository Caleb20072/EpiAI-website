import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { globalSearch } from '@/lib/users/repository';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get('q') || '';
    const results = await globalSearch(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
