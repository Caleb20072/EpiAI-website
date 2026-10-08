import { useTranslations } from 'next-intl';

export default function ProblemSection() {
    const t = useTranslations('About');

    return (
        <section id="about" className="scroll-mt-16 border-t border-default bg-card px-6 py-20 lg:py-24">
            <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                    <p className="kicker">{t('eyebrow')}</p>
                    <h2 className="section-title mt-3 text-primary">{t('motivation_title')}</h2>
                </div>
                <p className="text-[19px] leading-[1.6] text-secondary lg:col-span-7 lg:pt-9 sm:text-[21px]">
                    {t('motivation_text')}
                </p>
            </div>
        </section>
    );
}
