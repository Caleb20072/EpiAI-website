import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function JoinSection() {
    const t = useTranslations('HomePage');
    const tJoin = useTranslations('Join');

    return (
        <section className="bg-brand-600 px-6 py-20 text-white dark:bg-[#1b4db0]">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <h2 className="section-title text-white">{tJoin('cta_text')}</h2>
                    <p className="mt-4 text-[18px] leading-[1.6] text-white">{t('join_text')}</p>
                    <p className="mt-2 text-[16px] text-[#dce8fd]">{t('tagline')}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/join"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-[17px] font-medium text-[#1b4db0] transition-[background-color,transform] duration-[180ms] hover:bg-[#eef4fe] active:scale-[0.98]"
                    >
                        {t('join_btn')}
                    </Link>
                    <Link
                        href="/calendar"
                        className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/40 px-6 text-[17px] font-medium text-white transition-colors duration-[180ms] hover:bg-white/10"
                    >
                        {t('see_calendar')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
