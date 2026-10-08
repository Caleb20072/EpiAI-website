import { useTranslations } from 'next-intl';

export default function MissionSection() {
    const t = useTranslations('About');

    return (
        <section className="tile-canvas py-20 px-6">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-[40px] font-semibold leading-[1.1] mb-4 text-[#1d1d1f]">
                    {t('title')}
                </h2>
                <p className="text-[17px] text-[#333] leading-[1.47] max-w-2xl mx-auto">
                    {t('intro')}
                </p>

                <div className="mt-12 grid md:grid-cols-2 gap-4 text-left">
                    <div className="p-6 rounded-[18px] bg-white border border-[#e0e0e0]">
                        <h3 className="text-[17px] font-semibold mb-2 text-[#1d1d1f]">{t('approach_title')}</h3>
                        <p className="text-[17px] text-[#333] leading-[1.47]">{t('approach_text')}</p>
                    </div>
                    <div className="p-6 rounded-[18px] bg-white border border-[#e0e0e0]">
                        <h3 className="text-[17px] font-semibold mb-2 text-[#1d1d1f]">Excellence</h3>
                        <p className="text-[17px] text-[#333] leading-[1.47]">
                            Un cadre exigeant, où les étudiants maîtrisent les bases de l’IA et de la science des données.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
