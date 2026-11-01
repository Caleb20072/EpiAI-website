/**
 * Toutes les 5 minutes : envoie le lien + identifiants 10 min avant chaque test.
 */
export default async () => {
  const siteUrl = (
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ''
  ).replace(/\/$/, '');
  const secret = process.env.CRON_SECRET;

  if (!siteUrl || !secret) {
    console.error('[admission-reminders] Missing URL or CRON_SECRET');
    return;
  }

  const endpoint = `${siteUrl}/api/cron/admission-reminders`;
  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log('[admission-reminders] status=', res.status, 'body=', body.slice(0, 500));
};
