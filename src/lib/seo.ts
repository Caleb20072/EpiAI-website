import type { Metadata } from 'next';

const SITE = "Epi'AI";
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  locale?: string;
  image?: string;
}): Metadata {
  const locale = opts.locale || 'fr';
  const url = `${BASE}/${locale}${opts.path}`;
  const image = opts.image || `${BASE}/assets/epiai-logo.png`;

  return {
    title: `${opts.title} | ${SITE}`,
    description: opts.description,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: SITE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    alternates: {
      canonical: url,
      languages: { fr: `${BASE}/fr${opts.path}`, en: `${BASE}/en${opts.path}` },
    },
  };
}
