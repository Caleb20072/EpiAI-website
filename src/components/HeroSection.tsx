"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const ArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default function HeroSection() {
    const t = useTranslations('HomePage');

    return (
        <section
            id="home"
            className="relative flex min-h-[88svh] flex-col justify-end bg-[#1d1d1f] px-6 pb-20 pt-28 text-white"
        >
            <div className="mx-auto w-full max-w-[1440px]">
                <p className="mb-4 text-[17px] text-[#2997ff]">{t('subtitle')}</p>
                <h1 className="max-w-[14ch] text-[clamp(40px,6vw,68px)] font-semibold leading-[1.05] tracking-[-0.02em] text-white">
                    {t('title')}
                </h1>
                <p className="mt-6 max-w-[36rem] text-[21px] font-normal leading-[1.35] text-white/80">
                    {t('description')}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-6">
                    <Link
                        href="/join"
                        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0066cc] px-7 text-[18px] font-light text-white active:scale-95"
                    >
                        {t('join_btn')}
                        <ArrowRight />
                    </Link>
                    <Link href="/#projects" className="text-[17px] text-[#2997ff]">
                        {t('projects_btn')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
