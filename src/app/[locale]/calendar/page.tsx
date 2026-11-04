import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { normalizeImageUrl } from '@/lib/utils/image-url';
import { eventField, eventLocation } from '@/lib/events/locale';
import { buildPageMetadata } from '@/lib/seo';
import {
  CATEGORIES,
  SPECIAL_TALKS,
  resolveCategoryId,
} from '@/lib/events/categories';
import { SpecialTalksAccordion } from '@/components/events/SpecialTalksAccordion';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/calendar',
    title: SPECIAL_TALKS.brand,
    description: SPECIAL_TALKS.tagline[locale === 'fr' ? 'fr' : 'en'],
  });
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ series?: string }>;
}) {
  const locale = await getLocale();
  const fr = locale === 'fr';
  const { series: seriesParam } = await searchParams;
  const initialSeries =
    seriesParam && CATEGORIES.some((c) => c.id === seriesParam) ? seriesParam : null;

  const events = await prisma.event
    .findMany({
      where: { isPublished: true },
      orderBy: { date: 'desc' },
      take: 100,
    })
    .catch(() => []);

  const now = new Date();
  const talks = events.map((e) => ({
    id: e.id,
    title: eventField(e, locale, 'title'),
    description: eventField(e, locale, 'description'),
    date: e.date.toISOString(),
    location: eventLocation(e.location, locale),
    isOnline: e.isOnline,
    isPast: e.date < now,
    imageUrl: normalizeImageUrl(e.imageUrl) || undefined,
    categoryId: resolveCategoryId(e.categoryId),
    dateLabel: e.date.toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  }));

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-primary">
      <main className="mx-auto max-w-4xl px-6 py-24 sm:py-28">
        <div className="mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">
            {SPECIAL_TALKS.brand}
          </p>
          <h1 className="section-title mt-2 mb-3">
            {fr ? 'Nos séries de talks' : 'Our talk series'}
          </h1>
          <p className="max-w-2xl text-[17px] leading-[1.6] text-secondary">
            {SPECIAL_TALKS.tagline[fr ? 'fr' : 'en']}
          </p>
        </div>

        <SpecialTalksAccordion
          talks={talks}
          locale={fr ? 'fr' : 'en'}
          initialOpenId={initialSeries}
        />

        <p className="mt-10 text-center text-[14px] text-muted">
          {fr ? (
            <>
              Membre Epi’AI ?{' '}
              <Link href="/events" className="text-brand-700 hover:underline">
                Accéder à l’espace talks
              </Link>
            </>
          ) : (
            <>
              Epi’AI member?{' '}
              <Link href="/events" className="text-brand-700 hover:underline">
                Open the talks space
              </Link>
            </>
          )}
        </p>
      </main>
      <Footer />
    </div>
  );
}
