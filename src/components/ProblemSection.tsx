import { useTranslations } from 'next-intl';

export default function ProblemSection() {
    const t = useTranslations('About');

    return (
        <section className="py-20 px-4 bg-black/40 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="inline-block px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] font-bold mb-4 tracking-widest uppercase">
                    The Challenge
                </div>
                <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white tracking-tight">
                    {t('motivation_title')}
                </h2>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed font-light">
                    {t('motivation_text')}
                </p>
            </div>
        </section>
    );
}
