import { logger } from '@/lib/logger';
import { configureWebPush, webpush } from './vapid';
import {
  getUserPushSubscriptions,
  getClerkPushSubscriptions,
  removePushSubscriptionByEndpoint,
} from './subscriptions';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

async function sendToSubscriptions(
  subscriptions: Array<{ endpoint: string; p256dh: string; auth: string }>,
  payload: PushPayload,
) {
  if (!configureWebPush()) {
    logger.warn('Push skipped: VAPID keys not configured');
    return 0;
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    tag: payload.tag,
  });

  let sent = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body,
      );
      sent++;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await removePushSubscriptionByEndpoint(sub.endpoint);
      } else {
        logger.warn('Push delivery failed', { endpoint: sub.endpoint.slice(0, 40), err: String(err) });
      }
    }
  }
  return sent;
}

export async function sendPushToUserId(userId: string, payload: PushPayload) {
  const subs = await getUserPushSubscriptions(userId);
  if (subs.length === 0) return 0;
  return sendToSubscriptions(subs, payload);
}

export async function sendPushToClerkId(clerkId: string, payload: PushPayload) {
  const subs = await getClerkPushSubscriptions(clerkId);
  if (subs.length === 0) return 0;
  return sendToSubscriptions(subs, payload);
}
