'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Calendar, MapPin, Globe } from 'lucide-react';
import type { EventWithDetails } from '@/lib/events/types';
import { eventField } from '@/lib/events/locale';
import { EventCoverImage } from '@/components/events/EventCoverImage';
import { formatDate } from '@/lib/utils/date';

interface EventsSectionProps {
  initialEvents?: EventWithDetails[];
}

export default function EventsSection({ initialEvents = [] }: EventsSectionProps) {
  const locale = useLocale() as 'en' | 'fr';
  const t = useTranslations('HomePage');
  const events = initialEvents;

  return (
    <section id="events" className="scroll-mt-16 bg-card px-6 py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="section-title text-primary">{t('events_title')}</h2>
            <p className="mt-3 text-[17px] leading-[1.6] text-secondary">{t('events_intro')}</p>
          </div>
          <Link href="/calendar" className="link-quiet text-[16px]">
            {t('view_calendar')}
            <span aria-hidden>→</span>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-default bg-paper px-6 py-10">
            <Calendar className="h-6 w-6 text-muted" aria-hidden />
            <p className="text-[16px] text-secondary">{t('no_events')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const d = new Date(event.date);
              const title = eventField(event, locale, 'title');
              const description = eventField(event, locale, 'description');
              return (
                <article
                  key={event.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-default bg-card shadow-card transition-[border-color,box-shadow] duration-200 hover:border-brand-300 hover:shadow-elevated"
                >
                  <Link href={`/calendar/${event.id}`} className="absolute inset-0 z-10 rounded-xl" aria-label={title} />

                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-default bg-card-muted">
                    <EventCoverImage
                      src={event.imageUrl}
                      alt={title}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                      showGradient={false}
                    />
                    <span className="absolute left-4 top-4 flex w-12 flex-col items-center rounded-lg bg-card py-1.5 shadow-sm">
                      <span className="text-[19px] font-semibold leading-none text-brand-700 tabular-nums">{d.getDate()}</span>
                      <span className="mt-1 text-[11px] font-medium text-muted">
                        {new Intl.DateTimeFormat(locale, { month: 'short' }).format(d)}
                      </span>
                    </span>
                    {event.isPast ? (
                      <span className="absolute right-4 top-4 rounded-md bg-navy/85 px-2 py-1 text-[12px] font-medium text-white">
                        {t('past')}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[18px] font-semibold leading-snug text-primary transition-colors duration-[160ms] group-hover:text-brand-700">
                      {title}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {formatDate(event.date, locale)}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        {event.isOnline ? <Globe className="h-3.5 w-3.5" aria-hidden /> : <MapPin className="h-3.5 w-3.5" aria-hidden />}
                        <span className="max-w-[180px] truncate">{event.isOnline ? t('online') : event.location}</span>
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-[15px] leading-[1.6] text-secondary">{description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
