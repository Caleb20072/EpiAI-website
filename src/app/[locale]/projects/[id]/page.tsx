'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
    const t = useTranslations('Project_Detail');
    const tList = useTranslations('Projects_List');
    const { id } = useParams();

    // In a real app, fetch project data by ID
    // For now, we use the ID to pull from mock translations
    const title = tList(`proj_${id}_title`);
    const desc = tList(`proj_${id}_desc`);

    // Shared mock images from ProjectsSection
    const imageUrls = [
        "https://images.unsplash.com/photo-1525497230009-462ebde79344?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2000&auto=format&fit=crop"
    ];

    const techStacks = [
        ["Python", "TensorFlow", "OpenCV"],
        ["React", "Node.js", "GPT-4"],
        ["PyTorch", "Pandas", "Sklearn"],
        ["Flutter", "Firebase", "MLKit"],
        ["Rust", "Actix", "WASM"],
        ["Docker", "K8s", "Prometheus"]
    ];

    const idx = parseInt(id as string) || 0;

    return (
        <div className="relative min-h-screen font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden">
            {/* Background Image */}
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

            <main className="max-w-5xl mx-auto px-6 py-32 relative z-10">
                <Link href="/#projects" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-12 group">
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('back_btn')}
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side: Content */}
                    <div className="animate-fade-in-up">
                        <div className="mb-6 inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-[10px] font-bold uppercase tracking-widest text-blue-300">
                            Research & Development
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {title}
                        </h1>
                        <p className="text-xl text-gray-300 font-light leading-relaxed mb-12">
                            {desc}
                        </p>

                        <div className="space-y-12">
                            <section>
                                <h2 className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <span className="w-8 h-px bg-blue-400/30"></span>
                                    {t('challenge_title')}
                                </h2>
                                <p className="text-gray-400 font-light leading-relaxed">
                                    {t(`proj_${idx}_content`)}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-emerald-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <span className="w-8 h-px bg-emerald-400/30"></span>
                                    {t('results_title')}
                                </h2>
                                <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                                    <p className="text-emerald-300 font-mono text-sm">
                                        {t(`proj_${idx}_results`)}
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <span className="w-8 h-px bg-purple-400/30"></span>
                                    {t('tech_stack')}
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {techStacks[idx]?.map((tech) => (
                                        <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Right Side: Media */}
                    <div className="sticky top-32 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                            <Image
                                src={imageUrls[idx]}
                                alt={title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-white/60">
                                    <span>Industrial Partner</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    <span>2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
