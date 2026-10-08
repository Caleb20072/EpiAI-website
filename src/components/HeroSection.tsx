"use client";

import { useLocale, useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, MapPin, Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BrandWordmark } from '@/components/BrandLogo';
import { formatDate } from '@/lib/utils/date';
import type { EventWithDetails } from '@/lib/events/types';

const ArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

interface HeroSectionProps {
    nextEvent?: EventWithDetails | null;
}

export default function HeroSection({ nextEvent }: HeroSectionProps) {
    const t = useTranslations('HomePage');
    const tAbout = useTranslations('About');
    const locale = useLocale() as 'en' | 'fr';
    const reduceMotion = useReducedMotion();

    const domains = [
        { title: tAbout('domain_math'), text: t('domain_math_text') },
        { title: tAbout('domain_ai'), text: t('domain_ai_text') },
        { title: tAbout('domain_data'), text: t('domain_data_text') },
    ];

    return (
        <section id="home" className="bg-paper px-6 pt-16 text-primary">
            <div className="mx-auto grid max-w-[1280px] items-center gap-12 py-14 lg:grid-cols-12 lg:gap-16 lg:py-24">
                <div className="lg:col-span-7">
                    <p className="kicker flex items-center gap-3">
                        <span className="h-0.5 w-8 rounded-full bg-logo" aria-hidden />
                        {t('hero_kicker')}
                    </p>
                    <h1 className="display mt-5 max-w-[15ch] text-primary">
                        {t('hero_title')}
                    </h1>
                    <p className="mt-6 max-w-[34rem] text-[18px] leading-[1.6] text-secondary sm:text-[19px]">
                        {t('description')}
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link href="/join" className="btn-cta">
                            {t('join_btn')}
                            <ArrowRight />
                        </Link>
                        <Link href="/#projects" className="btn-brand-outline min-h-12 px-6 text-[17px]">
                            {t('projects_btn')}
                        </Link>
                    </div>
                </div>

                <motion.aside
                    className="lg:col-span-5"
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                    aria-label={tAbout('domains_title')}
                >
                    <div className="overflow-hidden rounded-xl border border-default bg-card shadow-elevated">
                        <div className="flex items-center justify-between gap-4 bg-logo px-6 py-5">
                            <BrandWordmark size="lg" className="rounded-none" />
                            <span className="text-right text-[13px] font-medium leading-snug text-white">
                                Epitech
                                <br />
                                {locale === 'fr' ? 'Bénin' : 'Benin'}
                            </span>
                        </div>

                        <div className="px-6 pt-5 pb-2">
                            <h2 className="text-[14px] font-semibold text-muted">{tAbout('domains_title')}</h2>
                            <ol className="mt-2 divide-y divide-subtle">
                                {domains.map((d, i) => (
                                    <li key={d.title} className="flex gap-4 py-4">
                                        <span className="w-6 shrink-0 pt-0.5 text-[14px] font-semibold tabular-nums text-brand-700">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div>
                                            <p className="text-[17px] font-semibold text-primary">{d.title}</p>
                                            <p className="mt-0.5 text-[15px] leading-[1.5] text-secondary">{d.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="border-t border-default bg-card-muted px-6 py-5">
                            <p className="text-[13px] font-semibold text-muted">{t('next_event')}</p>
                            {nextEvent ? (
                                <Link
                                    href={`/calendar/${nextEvent.id}`}
                                    className="group mt-2 flex items-start gap-4 rounded-lg"
                                >
                                    <span className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-default bg-card py-1.5">
                                        <span className="text-[19px] font-semibold leading-none text-brand-700 tabular-nums">
                                            {new Date(nextEvent.date).getDate()}
                                        </span>
                                        <span className="mt-1 text-[11px] font-medium text-muted">
                                            {new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(nextEvent.date))}
                                        </span>
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[16px] font-semibold text-primary group-hover:text-brand-700 transition-colors duration-[160ms]">
                                            {nextEvent.title}
                                        </span>
                                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" aria-hidden />
                                                {formatDate(nextEvent.date, locale)}
                                            </span>
                                            <span className="inline-flex min-w-0 items-center gap-1.5">
                                                {nextEvent.isOnline ? <Globe className="h-3.5 w-3.5" aria-hidden /> : <MapPin className="h-3.5 w-3.5" aria-hidden />}
                                                <span className="truncate">{nextEvent.isOnline ? t('online') : nextEvent.location}</span>
                                            </span>
                                        </span>
                                    </span>
                                </Link>
                            ) : (
                                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-[15px] text-secondary">{t('no_upcoming')}</p>
                                    <Link href="/calendar" className="link-quiet text-[15px]">
                                        {t('see_calendar')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.aside>
            </div>
        </section>
    );
}
