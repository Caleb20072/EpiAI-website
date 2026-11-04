'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Calendar,
  ChevronDown,
  FlaskConical,
  Globe,
  GraduationCap,
  Hammer,
  MapPin,
  Mic2,
  Sparkles,
} from 'lucide-react';
import type { EventWithDetails } from '@/lib/events/types';
import { CATEGORIES, SPECIAL_TALKS, resolveCategoryId } from '@/lib/events/categories';
import { eventField, eventLocation } from '@/lib/events/locale';
import { EventCoverImage } from '@/components/events/EventCoverImage';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

const ICONS = {
  Sparkles,
  Mic2,
  FlaskConical,
  Hammer,
  GraduationCap,
} as const;

interface EventsSectionProps {
  initialEvents?: EventWithDetails[];
}

export default function EventsSection({ initialEvents = [] }: EventsSectionProps) {
  const locale = useLocale() as 'en' | 'fr';
  const t = useTranslations('HomePage');
  const [openId, setOpenId] = useState<string | null>(CATEGORIES[0]?.id ?? null);

  const byCategory = useMemo(() => {
    const map: Record<string, EventWithDetails[]> = {};
    for (const cat of CATEGORIES) map[cat.id] = [];
    for (const event of initialEvents) {
      const id = resolveCategoryId(event.categoryId);
      if (!map[id]) map[id] = [];
      map[id].push(event);
    }
    for (const id of Object.keys(map)) {
      map[id].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return map;
  }, [initialEvents]);

  return (
    <section id="special-talks" className="scroll-mt-16 bg-card px-6 py-20 lg:py-24">
      {/* Ancre legacy pour /#events */}
      <div id="events" className="sr-only" aria-hidden />

      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">
              {SPECIAL_TALKS.brand}
            </p>
            <h2 className="section-title mt-2 text-primary">{t('events_title')}</h2>
            <p className="mt-3 text-[17px] leading-[1.6] text-secondary">{t('events_intro')}</p>
          </div>
          <Link href="/calendar" className="link-quiet text-[16px]">
            {t('view_calendar')}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="divide-y divide-default border-y border-default">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon as keyof typeof ICONS] || Mic2;
            const talks = byCategory[cat.id] || [];
            const open = openId === cat.id;
            const label = cat.name[locale] || cat.name.en;
            const blurb = cat.description?.[locale] || cat.description?.en || '';

            return (
              <div key={cat.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : cat.id)}
                  className="flex w-full cursor-pointer items-start gap-4 py-5 text-left transition-colors duration-160 hover:bg-card-muted/60"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      cat.bgColor,
                    )}
                  >
                    <Icon className={cn('h-5 w-5', cat.color)} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-[18px] font-semibold text-primary">{label}</span>
                      <span className="text-[13px] text-muted">
                        {talks.length === 0
                          ? t('talks_empty_count')
                          : talks.length === 1
                            ? t('talks_count_one')
                            : t('talks_count', { count: talks.length })}
                      </span>
                    </span>
                    <span className="mt-1 block text-[15px] leading-[1.55] text-secondary">{blurb}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'mt-2 h-5 w-5 shrink-0 text-muted transition-transform duration-200',
                      open && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </button>

                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="pb-6 pl-0 sm:pl-14">
                      {talks.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-default bg-paper px-4 py-5 text-[15px] text-secondary">
                          {t('talks_coming_soon')}
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {talks.map((event) => {
                            const title = eventField(event, locale, 'title');
                            const description = eventField(event, locale, 'description');
                            return (
                              <li key={event.id}>
                                <Link
                                  href={`/calendar/${event.id}`}
                                  className="group flex flex-col gap-3 rounded-xl border border-default bg-paper p-3 transition-[border-color,box-shadow] duration-200 hover:border-brand-300 hover:shadow-elevated sm:flex-row sm:items-stretch"
                                >
                                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg bg-card-muted sm:aspect-auto sm:h-auto sm:w-36">
                                    <EventCoverImage
                                      src={event.imageUrl}
                                      alt={title}
                                      className="h-full w-full"
                                      imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                                      showGradient={false}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1 py-0.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="text-[16px] font-semibold text-primary group-hover:text-brand-700">
                                        {title}
                                      </h3>
                                      {event.isPast ? (
                                        <span className="rounded-md bg-navy/80 px-2 py-0.5 text-[11px] font-medium text-white">
                                          {t('past')}
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                                      <span className="inline-flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                                        {formatDate(event.date, locale)}
                                      </span>
                                      <span className="inline-flex min-w-0 items-center gap-1.5">
                                        {event.isOnline ? (
                                          <Globe className="h-3.5 w-3.5" aria-hidden />
                                        ) : (
                                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                                        )}
                                        <span className="max-w-[200px] truncate">
                                          {event.isOnline
                                            ? t('online')
                                            : eventLocation(event.location, locale)}
                                        </span>
                                      </span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-secondary">
                                      {description}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
