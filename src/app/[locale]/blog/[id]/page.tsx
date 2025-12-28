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

    // Fallback to 0 if id is not a number or out of bounds
    const idx = parseInt(id as string);
    const validIdx = isNaN(idx) || idx < 0 || idx > 5 ? 0 : idx;

    const title = tList(`post_${validIdx}_title`);
    const desc = tList(`post_${validIdx}_desc`);

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

    return (
        <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 -z-10">
                <Image
                    src="/assets/Sleek elegance, shadowed depth.jpg"
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
                            <span>{categories[validIdx]}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                            <span className="text-gray-500">{dates[validIdx]}</span>
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
                            src={imageUrls[validIdx]}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="space-y-8 text-gray-300 font-light leading-relaxed">
                            <p>
                                {t(`post_${validIdx}_content`)}
                            </p>
                            <p>
                                Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.
                            </p>
                            <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md my-12">
                                <h3 className="text-white font-bold mb-4">Core Philosophy</h3>
                                <p className="text-sm text-gray-400 italic">
                                    "Innovation at Epi'AI is driven by a deep understanding of the mathematical foundations that power modern algorithms."
                                </p>
                            </div>
                            <p>
                                Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi.
                            </p>
                        </div>
                    </div>

                    <footer className="mt-20 pt-12 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                                EA
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Epi'AI Research Hub</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest">{t('author')}</div>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {t('reading_time')}: 5-7 MIN
                        </div>
                    </footer>
                </article>
            </main>

            <Footer />
        </div>
    );
}
