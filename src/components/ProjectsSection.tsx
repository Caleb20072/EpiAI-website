'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';

interface Project {
    _id: string;
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    imageUrl: string;
    status: string;
    techStack: string[];
    githubUrl: string;
    discoveryUrl: string;
}

export default function ProjectsSection() {
    const tHeader = useTranslations('Header');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [locale, setLocale] = useState<'en' | 'fr'>('en');

    // Get locale from URL
    useEffect(() => {
        const path = window.location.pathname;
        const detectedLocale = path.startsWith('/fr') ? 'fr' : 'en';
        setLocale(detectedLocale);
    }, []);

    // Fetch real projects from API
    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch('/api/projects');
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    const statusColors = {
        "Live": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        "Beta": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        "In Development": "bg-blue-500/20 text-blue-300 border-blue-500/30",
        "Prototype": "bg-purple-500/20 text-purple-300 border-purple-500/30",
        "Archived": "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };

    return (
        <section id="projects" className="py-24 px-4 min-h-screen flex flex-col justify-center relative bg-black/20">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white text-glow tracking-tight">{tHeader('projects')}</h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm font-light">
                        {locale === 'fr'
                            ? 'Découvrez les solutions innovantes et les défis techniques relevés par nos équipes étudiantes.'
                            : 'Discover the innovative solutions and technical challenges tackled by our student teams.'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-emerald-400 rounded-full"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-white/40">
                            {locale === 'fr' ? 'Aucun projet publié pour le moment' : 'No projects published yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <div key={project._id} className="group relative rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col h-full">
                                {/* Main Link Overlay */}
                                <Link href={`/projects/${project._id}`} className="absolute inset-0 z-0" aria-label={project.title[locale]} />

                                {/* Project Header - Image with Overlay */}
                                <div className="h-48 relative w-full border-b border-white/5 bg-gray-900 overflow-hidden">
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.title[locale]}
                                        fill
                                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusColors[project.status as keyof typeof statusColors] || statusColors['Live']}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Project Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors font-mono">
                                        {project.title[locale]}
                                    </h3>

                                    <p className="text-gray-400 leading-relaxed mb-6 font-light text-sm line-clamp-3">
                                        {project.description[locale]}
                                    </p>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                        {project.techStack.map((tech) => (
                                            <span key={tech} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 relative z-10">
                                        {project.githubUrl && (
                                            <a
                                                href={project.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-xs font-semibold group/btn"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                                GitHub
                                            </a>
                                        )}
                                        {project.discoveryUrl && (
                                            <a
                                                href={project.discoveryUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all text-xs font-semibold"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" clipRule="evenodd" /></svg>
                                                Discovery
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
