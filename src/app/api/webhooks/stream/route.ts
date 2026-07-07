import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { CHAT_CHANNELS } from '@/lib/chat/channels';
import { notifyUser } from '@/lib/notifications/service';
import { logger } from '@/lib/logger';

function verifyStreamSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.STREAM_API_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return expected === signature;
  }
}

function channelDisplayName(channelId: string): string {
  const ch = CHAT_CHANNELS.find((c) => c.id === channelId);
  return ch?.name || channelId;
}

/** POST /api/webhooks/stream — nouveau message chat → alertes push hors ligne */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');

  if (!verifyStreamSignature(rawBody, signature)) {
    logger.warn('Stream webhook: invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.type !== 'message.new') {
    return NextResponse.json({ ok: true, skipped: event.type });
  }

  const message = event.message as { text?: string; user?: { id?: string; name?: string } } | undefined;
  const channelId = (event.channel_id as string) || (event.cid as string)?.split(':')[1];
  const senderId = message?.user?.id;
  const senderName = message?.user?.name || 'Un membre';
  const text = (message?.text || '').trim();

  if (!channelId || !senderId || !text) {
    return NextResponse.json({ ok: true, skipped: 'incomplete payload' });
  }

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Stream not configured' }, { status: 503 });
  }

  const serverClient = StreamChat.getInstance(apiKey, apiSecret);
  const channel = serverClient.channel('messaging', channelId);
  const state = await channel.query({ messages: { limit: 0 } });
  const memberIds = Object.keys(state.members || {});

  const channelName = channelDisplayName(channelId);
  const preview = text.length > 120 ? `${text.slice(0, 117)}…` : text;
  let notified = 0;

  for (const memberId of memberIds) {
    if (memberId === senderId || memberId === 'system') continue;

    await notifyUser({
      clerkId: memberId,
      type: 'chat',
      title: `Nouveau message — ${channelName}`,
      message: `${senderName} : ${preview}`,
      link: '/chat',
      skipEmail: true,
    });
    notified++;
  }

  logger.info('Stream chat push sent', { channelId, notified, senderId });
  return NextResponse.json({ ok: true, notified });
}
