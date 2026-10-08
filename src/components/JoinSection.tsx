import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function JoinSection() {
    const t = useTranslations('HomePage');
    const tJoin = useTranslations('Join');

    return (
        <section className="tile-black py-24 px-6">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-[40px] font-semibold text-white mb-4 leading-[1.1]">{tJoin('cta_text')}</h2>
                <p className="text-[21px] text-white/80 mb-8 font-normal leading-[1.19]">
                    Une communauté d’étudiants qui travaillent les bases de l’IA et de la science des données.
                </p>
                <Link
                    href="/join"
                    className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-[#0066cc] text-white text-[18px] font-light active:scale-95 transition-transform"
                >
                    {t('join_btn')}
                </Link>
            </div>
        </section>
    );
}
