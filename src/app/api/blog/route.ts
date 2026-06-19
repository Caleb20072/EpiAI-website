import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPublishedPosts, getAllPosts, createPost } from '@/lib/blog/repository';
import { checkUserPermission } from '@/lib/auth/checkPermission';

export async function GET(request: NextRequest) {
  try {
    const admin = request.nextUrl.searchParams.get('admin') === 'true';
    if (admin) {
      const perm = await checkUserPermission('content.create');
      if ('error' in perm) {
        return NextResponse.json({ error: perm.error }, { status: perm.status });
      }
      const posts = await getAllPosts(true);
      return NextResponse.json(posts);
    }
    const posts = await getPublishedPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('[API] Blog list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const perm = await checkUserPermission('content.create');
    if ('error' in perm) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    const body = await request.json();
    const post = await createPost({
      ...body,
      createdBy: perm.userId,
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('[API] Blog create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
