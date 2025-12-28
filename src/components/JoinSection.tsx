import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function JoinSection() {
    const t = useTranslations('HomePage');
    const tJoin = useTranslations('Join');

    return (
        <section className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 -z-10"></div>
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-glow tracking-tight">{tJoin('cta_text')}</h2>
                <p className="text-lg text-blue-200 mb-10 font-light">
                    Join a community of passionate students mastering the foundations of AI and Data Science.
                </p>
                <Link href="/join">
                    <button className="px-10 py-4 rounded-full bg-white text-blue-900 font-bold text-lg hover:bg-blue-50 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transform duration-300">
                        {t('join_btn')}
                    </button>
                </Link>
            </div>
        </section>
    );
}
