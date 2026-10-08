import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

export default function ImpactSection() {
    const t = useTranslations('About');
    const tHome = useTranslations('HomePage');

    const items = [
        tHome('impact_item_master'),
        tHome('impact_item_science'),
        tHome('impact_item_growth'),
    ];

    return (
        <section className="bg-paper px-6 py-20 lg:py-24">
            <div className="mx-auto grid max-w-[1280px] items-start gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                    <h2 className="section-title text-primary">{t('impact_title')}</h2>
                    <p className="mt-4 text-[17px] leading-[1.6] text-secondary">{t('impact_text')}</p>
                </div>
                <ul className="overflow-hidden rounded-xl border border-default bg-card shadow-card divide-y divide-subtle lg:col-span-7">
                    {items.map((label) => (
                        <li key={label} className="flex items-center gap-4 px-6 py-5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                                <Check className="h-[18px] w-[18px]" aria-hidden />
                            </span>
                            <span className="text-[17px] font-medium text-primary">{label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
