import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';

const PRIVATE = [
  'admin',
  'dashboard',
  'sign-in',
  'sign-up',
  'forgot-password',
  'reset-password',
  'verify-email',
  'setup-admin',
  'intranet',
  'modules',
  'forum',
  'chat',
  'resources',
  'settings',
  'profile',
  'presence',
  'attendance',
  'suivi',
  'my-registrations',
  'my-resources',
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/api/', ...['fr', 'en'].flatMap((locale) => PRIVATE.map((path) => `/${locale}/${path}`))];

  return {
    rules: { userAgent: '*', allow: '/', disallow },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
