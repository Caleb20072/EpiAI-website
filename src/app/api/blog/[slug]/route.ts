import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { getPostBySlug, updatePost, deletePost } from '@/lib/blog/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (post.status !== 'published') {
      const perm = await checkUserPermission('content.create');
      if ('error' in perm) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('[API] Blog post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const perm = await checkUserPermission('content.create');
    if ('error' in perm) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const updated = await updatePost(post.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] Blog update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const perm = await checkUserPermission('content.create');
    if ('error' in perm) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await deletePost(post.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Blog delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
