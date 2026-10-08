import { useTranslations } from 'next-intl';

export default function MissionSection() {
    const t = useTranslations('About');

    const pillars = [
        { title: t('approach_title'), text: t('approach_text') },
        { title: t('excellence_title'), text: t('excellence_text') },
    ];

    return (
        <section className="bg-card px-6 pb-20 lg:pb-24">
            <div className="mx-auto max-w-[1280px] border-t border-default pt-16 lg:pt-20">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-5">
                        <h2 className="section-title text-primary">{t('title')}</h2>
                        <p className="mt-4 max-w-md text-[17px] leading-[1.6] text-secondary">{t('intro')}</p>
                    </div>
                    <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:gap-12">
                        {pillars.map((p, i) => (
                            <div key={p.title} className="border-t-2 border-brand-600 pt-5">
                                <p className="text-[14px] font-semibold tabular-nums text-brand-700">
                                    {String(i + 1).padStart(2, '0')}
                                </p>
                                <h3 className="mt-2 text-[21px] font-semibold text-primary">{p.title}</h3>
                                <p className="mt-2 text-[16px] leading-[1.6] text-secondary">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
