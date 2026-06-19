import { useTranslations } from 'next-intl';

export default function AboutSection() {
    const t = useTranslations('About');

    return (
        <section id="about" className="py-24 px-4 min-h-screen flex flex-col justify-center relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/3 w-full h-[500px] bg-purple-900/10 rounded-full blur-[120px] -z-10 transform -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto w-full">
                {/* Hero Section */}
                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-purple-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        {t('title')}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light drop-shadow-md">
                        {t('intro')}
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Card 1: Motivation */}
                    <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-xl hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:border-purple-400/30 group">
                        <h3 className="text-2xl font-bold mb-4 text-purple-300 group-hover:text-purple-200 transition-colors">{t('motivation_title')}</h3>
                        <p className="text-gray-300 leading-relaxed text-base font-light">
                            {t('motivation_text')}
                        </p>
                    </div>

                    {/* Card 2: Approach */}
                    <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-xl hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-400/30 group">
                        <h3 className="text-2xl font-bold mb-4 text-blue-300 group-hover:text-blue-200 transition-colors">{t('approach_title')}</h3>
                        <p className="text-gray-300 leading-relaxed text-base font-light">
                            {t('approach_text')}
                        </p>
                    </div>

                    {/* Card 3: Impact */}
                    <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-xl hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:border-cyan-400/30 group">
                        <h3 className="text-2xl font-bold mb-4 text-cyan-300 group-hover:text-cyan-200 transition-colors">{t('impact_title')}</h3>
                        <p className="text-gray-300 leading-relaxed text-base font-light">
                            {t('impact_text')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
