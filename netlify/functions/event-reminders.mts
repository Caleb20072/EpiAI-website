/**
 * Scheduled Function Netlify — remplace Vercel Cron.
 * Appelle la route Next existante /api/cron/event-reminders avec CRON_SECRET.
 *
 * Variables requises (Site settings → Environment variables) :
 * - CRON_SECRET
 * - URL (injectée auto par Netlify) ou NEXT_PUBLIC_SITE_URL
 */
export default async () => {
  const siteUrl = (
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''
  ).replace(/\/$/, '');
  const secret = process.env.CRON_SECRET;

  if (!siteUrl) {
    console.error('[event-reminders] Missing site URL (URL / NEXT_PUBLIC_SITE_URL)');
    return;
  }
  if (!secret) {
    console.error('[event-reminders] Missing CRON_SECRET');
    return;
  }

  const endpoint = `${siteUrl}/api/cron/event-reminders`;
  console.log('[event-reminders] Calling', endpoint);

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log('[event-reminders] status=', res.status, 'body=', body.slice(0, 500));
};
