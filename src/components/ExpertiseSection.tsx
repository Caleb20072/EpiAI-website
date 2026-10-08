import { useTranslations } from 'next-intl';

const iconClass = 'h-7 w-7 text-[#86aef6]';

export default function ExpertiseSection() {
    const t = useTranslations('About');
    const tHome = useTranslations('HomePage');

    const pillars = [
        {
            title: t('domain_math'),
            topics: tHome('math_topics').split(';'),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 19l6-14 3.5 8.5L20 5" />
                    <path d="M4 12h16" />
                    <path d="M3 19h1a1 1 0 0 0 1-1V5" />
                </svg>
            ),
        },
        {
            title: t('domain_ai'),
            topics: tHome('ai_topics').split(';'),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                    <path d="M12 8v-2" />
                    <path d="M12 16v2" />
                    <path d="M16 12h2" />
                    <path d="M8 12H6" />
                    <path d="M9.5 9l-1.5-1.5" />
                    <path d="M14.5 9l1.5-1.5" />
                    <path d="M9.5 15l-1.5 1.5" />
                    <path d="M14.5 15l1.5 1.5" />
                </svg>
            ),
        },
        {
            title: t('domain_data'),
            topics: tHome('data_topics').split(';'),
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                </svg>
            ),
        },
    ];

    return (
        <section className="bg-navy px-6 py-20 text-[#e8edf8] lg:py-24">
            <div className="mx-auto max-w-[1280px]">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <h2 className="section-title max-w-xl text-white">{tHome('domains_heading')}</h2>
                    <p className="text-[16px] text-[#aab5cf]">{tHome('subtitle')}</p>
                </div>

                <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-3">
                    {pillars.map((pillar) => (
                        <div key={pillar.title} className="bg-navy p-7 lg:p-8">
                            {pillar.svg}
                            <h3 className="mt-5 text-[22px] font-semibold text-white">{pillar.title}</h3>
                            <ul className="mt-4 space-y-2.5">
                                {pillar.topics.map((topic) => (
                                    <li key={topic} className="flex items-center gap-3 text-[16px] text-[#e8edf8]">
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-logo" aria-hidden />
                                        {topic}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
