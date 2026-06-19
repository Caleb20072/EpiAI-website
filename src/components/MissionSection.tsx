import { useTranslations } from 'next-intl';

export default function MissionSection() {
    const t = useTranslations('About');

    return (
        <section className="py-20 px-4 relative">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-purple-300 tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto font-light">
                    {t('intro')}
                </p>

                <div className="mt-12 grid md:grid-cols-2 gap-6 text-left">
                    <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all shadow-xl hover:-translate-y-1">
                        <h3 className="text-xl font-bold mb-3 text-blue-300">{t('approach_title')}</h3>
                        <p className="text-sm text-gray-300 font-light leading-relaxed">{t('approach_text')}</p>
                    </div>

                    <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all shadow-xl hover:-translate-y-1">
                        <h3 className="text-xl font-bold mb-3 text-purple-300">Excellence</h3>
                        <p className="text-sm text-gray-300 font-light leading-relaxed">
                            We foster a rigorous environment where students master the theoretical foundations of AI and Data Science.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
