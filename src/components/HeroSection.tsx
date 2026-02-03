import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function HeroSection() {
    const t = useTranslations('HomePage');

    return (
        <section id="home" className="flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20 relative overflow-hidden">

            {/* Glow Blobs */}
            <div className="blob bg-blue-600 w-96 h-96 rounded-full top-0 left-[-100px] animate-pulse-slow"></div>
            <div className="blob bg-purple-600 w-96 h-96 rounded-full bottom-0 right-[-100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-5xl mx-auto animate-fade-in-up relative z-10">

                {/* Logos Row */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-10 mb-12 animate-float">
                    {/* Epi'AI Logo */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/20 overflow-hidden bg-black shadow-2xl">
                        <Image
                            src="/assets/logo.jpg"
                            alt="Epi'AI Logo"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="hidden sm:block h-16 w-px bg-white/20"></div>

                    {/* Epitech Logo */}
                    <div className="relative w-auto h-12 md:h-16 flex items-center justify-center">
                        {/* Epitech Logo */}
                        <div className="relative w-48 h-16 md:w-56 md:h-20 flex items-center justify-center">
                            <Image
                                src="/assets/epi_logo.jpg"
                                alt="Epitech Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Subtitle */}
                <div className="mb-6 inline-block px-6 py-2 rounded-full bg-white/5 border border-white/20 text-xs md:text-sm text-blue-300 font-bold tracking-[0.2em] uppercase shadow-lg backdrop-blur-md">
                    {t('subtitle')}
                </div>

                <h1 className="text-4xl md:text-7xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-50 via-white to-purple-100 leading-tight drop-shadow-2xl text-glow tracking-tighter">
                    {t('title')}
                </h1>

                <p className="text-base md:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
                    {t('description')}
                </p>

                <p className="text-base md:text-lg text-blue-200 font-medium max-w-2xl mx-auto mb-12 italic">
                    {t('tagline')}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link href="/join">
                        <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base md:text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transform hover:-translate-y-1.5 active:scale-95">
                            {t('join_btn')}
                        </button>
                    </Link>
                    <Link href="/#projects" className="px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/40 font-bold text-base md:text-lg transition-all backdrop-blur-md shadow-lg hover:shadow-white/10 transform hover:-translate-y-1.5 active:scale-95">
                        {t('projects_btn')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
