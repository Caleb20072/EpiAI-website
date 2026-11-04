import { StreamChat } from 'stream-chat';
import { getSiteUrl } from '@/lib/email/resend';
import { logger } from '@/lib/logger';

let ensurePromise: Promise<boolean> | null = null;

/**
 * Enregistre le webhook Stream Chat vers notre API (push hors ligne).
 * Idempotent - un seul appel réseau par process Node.
 */
export function ensureStreamWebhook(): Promise<boolean> {
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    if (!apiKey || !apiSecret) return false;

    const site = getSiteUrl();
    if (!site || site.includes('localhost')) {
      logger.info('Stream webhook skipped (local site URL)');
      return false;
    }

    const webhookUrl = `${site}/api/webhooks/stream`;

    try {
      const client = StreamChat.getInstance(apiKey, apiSecret);
      await client.updateAppSettings({
        webhook_url: webhookUrl,
      });
      logger.info('Stream webhook registered', { webhookUrl });
      return true;
    } catch (err) {
      logger.warn('Stream webhook registration failed', { err: String(err) });
      ensurePromise = null;
      return false;
    }
  })();

  return ensurePromise;
}
