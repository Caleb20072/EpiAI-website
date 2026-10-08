import { useTranslations } from 'next-intl';

const impactItems = [
    {
        label: 'Master Production',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        ),
    },
    {
        label: 'Scientific Excellence',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        ),
    },
    {
        label: 'Student Growth',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.5-4.17M 5.5 5.5A100 100 0 00 20 20" />
        ),
    },
];

export default function ImpactSection() {
    const t = useTranslations('About');

    return (
        <section className="tile-parchment py-20 px-6">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-[40px] font-semibold mb-4 text-[#1d1d1f]">{t('impact_title')}</h2>
                    <p className="text-[17px] text-[#333] leading-[1.47] mb-8">
                        {t('impact_text')}
                    </p>
                    <div className="flex flex-col gap-4">
                        {impactItems.map((item) => (
                            <div key={item.label} className="flex items-center gap-4 text-[#1d1d1f]">
                                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/25 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {item.icon}
                                    </svg>
                                </div>
                                <span className="text-base font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
