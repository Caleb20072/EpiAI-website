import { useTranslations } from 'next-intl';

export default function ProblemSection() {
    const t = useTranslations('About');

    return (
        <section className="tile-parchment py-20 px-6">
            <div className="max-w-3xl mx-auto text-center">
                <p className="text-[14px] text-[#0066cc] mb-3">Le défi</p>
                <h2 className="text-[34px] md:text-[40px] font-semibold leading-[1.1] mb-6 text-[#1d1d1f]">
                    {t('motivation_title')}
                </h2>
                <p className="text-[17px] text-[#333] leading-[1.47]">
                    {t('motivation_text')}
                </p>
            </div>
        </section>
    );
}
