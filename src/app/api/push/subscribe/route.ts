import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/users/repository';
import { savePushSubscription, removePushSubscription } from '@/lib/push/subscriptions';

/** POST /api/push/subscribe — enregistrer un abonnement push navigateur */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    await savePushSubscription(
      dbUser.id,
      { endpoint, keys },
      request.headers.get('user-agent') || undefined,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[push/subscribe] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/push/subscribe — désactiver les notifications push */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = body.endpoint as string | undefined;

    if (endpoint) {
      await removePushSubscription(dbUser.id, endpoint);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[push/subscribe] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
