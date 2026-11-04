'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  ChevronDown,
  FlaskConical,
  GraduationCap,
  Hammer,
  Mic2,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/events/categories';
import { cn } from '@/lib/utils/cn';

const ICONS = {
  Sparkles,
  Mic2,
  FlaskConical,
  Hammer,
  GraduationCap,
} as const;

export type SpecialTalkListItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  location: string;
  isOnline: boolean;
  isPast: boolean;
  imageUrl?: string;
  categoryId: string;
};

type Props = {
  talks: SpecialTalkListItem[];
  locale: 'fr' | 'en';
  initialOpenId?: string | null;
};

export function SpecialTalksAccordion({ talks, locale, initialOpenId = null }: Props) {
  const fr = locale === 'fr';
  const [openId, setOpenId] = useState<string | null>(
    initialOpenId || CATEGORIES[0]?.id || null,
  );

  const byCategory = useMemo(() => {
    const map: Record<string, SpecialTalkListItem[]> = {};
    for (const cat of CATEGORIES) map[cat.id] = [];
    for (const talk of talks) {
      const id = talk.categoryId;
      if (!map[id]) map[id] = [];
      map[id].push(talk);
    }
    return map;
  }, [talks]);

  return (
    <div className="divide-y divide-default border-y border-default">
      {CATEGORIES.map((cat) => {
        const Icon = ICONS[cat.icon as keyof typeof ICONS] || Mic2;
        const items = byCategory[cat.id] || [];
        const open = openId === cat.id;
        const label = cat.name[locale];
        const blurb = cat.description?.[locale] || '';

        return (
          <div key={cat.id} id={cat.slug}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : cat.id)}
              className="flex w-full cursor-pointer items-start gap-4 py-5 text-left transition-colors duration-160 hover:bg-card-muted/50"
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
                    {items.length === 0
                      ? fr
                        ? 'Bientôt'
                        : 'Coming soon'
                      : fr
                        ? `${items.length} talk${items.length > 1 ? 's' : ''}`
                        : `${items.length} talk${items.length > 1 ? 's' : ''}`}
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
                <div className="pb-6 sm:pl-14">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-default bg-card px-4 py-5 text-[15px] text-secondary">
                      {fr
                        ? 'Aucun talk dans cette série pour le moment — le contenu arrivera au fil des prochaines sessions.'
                        : 'No talk in this series yet — content will arrive with upcoming sessions.'}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {items.map((talk) => (
                        <li key={talk.id}>
                          <Link
                            href={`/calendar/${talk.id}`}
                            className="flex flex-col gap-3 rounded-xl border border-default bg-card p-4 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-brand-300 hover:shadow-elevated sm:flex-row sm:items-center"
                          >
                            {talk.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={talk.imageUrl}
                                alt=""
                                className="h-36 w-full shrink-0 rounded-lg object-cover sm:h-20 sm:w-28"
                              />
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-card-muted text-center">
                                <span className="text-[22px] font-semibold text-brand-700 tabular-nums">
                                  {new Date(talk.date).getDate()}
                                </span>
                                <span className="text-[11px] text-muted">
                                  {new Date(talk.date).toLocaleDateString(locale, {
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-[17px] font-semibold text-primary">{talk.title}</h2>
                                {talk.isPast ? (
                                  <span className="rounded-full border border-default px-2 py-0.5 text-[12px] text-muted">
                                    {fr ? 'Passé' : 'Past'}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-[14px] text-secondary">{talk.location}</p>
                              <p className="mt-0.5 text-[12px] text-muted">{talk.dateLabel}</p>
                              <p className="mt-2 line-clamp-2 text-[14px] leading-[1.5] text-secondary">
                                {talk.description}
                              </p>
                            </div>
                            <span className="shrink-0 text-[15px] font-medium text-brand-700">
                              {fr ? 'Voir →' : 'View →'}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
