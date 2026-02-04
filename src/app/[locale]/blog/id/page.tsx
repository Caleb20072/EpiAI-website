'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

export default function BlogDetailPage() {
    const t = useTranslations('Blog_Detail');
    const tList = useTranslations('Blog_Posts');
    const { id } = useParams();

    const title = tList(`post_${id}_title`);
    const desc = tList(`post_${id}_desc`);

    // Shared mock images from BlogSection
    const imageUrls = [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504384308090-c54be3852f33?q=80&w=2000&auto=format&fit=crop"
    ];

    const categories = ["Visual Computing", "Analytics", "Machine Learning", "Neural Networks", "Deep Learning", "Robotics"];
    const dates = ["Oct 24, 2024", "Nov 02, 2024", "Nov 15, 2024", "Dec 01, 2024", "Dec 10, 2024", "Dec 20, 2024"];

    const idx = parseInt(id as string) || 0;

    return (
        <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 -z-10">
                <Image
                    src="/assets/hero-bg.jpg"
                    alt="Background"
                    fill
                    className="object-cover brightness-[0.2] scale-105"
                    priority
                />
            </div>

            <Header />

            <main className="max-w-4xl mx-auto px-6 py-32 relative z-10">
                <Link href="/blog" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-12 group">
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('back_btn')}
                </Link>

                <article className="animate-fade-in-up">
                    <header className="mb-12">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-6">
                            <span>{categories[idx]}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                            <span className="text-gray-500">{dates[idx]}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                            {title}
                        </h1>
                        <p className="text-xl text-gray-400 font-light leading-relaxed italic border-l-4 border-blue-600/30 pl-6">
                            {desc}
                        </p>
                    </header>

                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl mb-16">
                        <Image
                            src={imageUrls[idx]}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="space-y-8 text-gray-300 font-light leading-relaxed">
                            <p>
                                {t(`post_${idx}_content`)}
                            </p>
                            <p>
                                Curabitur aliquet quam id dui posuere blandit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.
                            </p>
                            <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md my-12">
                                <h3 className="text-white font-bold mb-4">Key Insight</h3>
                                <p className="text-sm text-gray-400 italic">
                                    "The intersection of mathematics and artificial intelligence is not just a technical necessity, but a philosophical frontier."
                                </p>
                            </div>
                            <p>
                                Nulla quis lorem ut libero malesuada feugiat. Donec rutrum congue leo eget malesuada. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.
                            </p>
                        </div>
                    </div>

                    <footer className="mt-20 pt-12 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                                EA
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Epi'AI Pole Research</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">{t('author')}</div>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {t('reading_time')}: 5 MIN
                        </div>
                    </footer>
                </article>
            </main>

            <Footer />
        </div>
    );
}
