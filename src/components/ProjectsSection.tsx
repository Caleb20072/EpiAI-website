'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { discoveryLinkLabel } from '@/lib/projects/links';
import type { ProjectApiShape } from '@/lib/projects/repository';

interface ProjectsSectionProps {
    initialProjects?: ProjectApiShape[];
}

export default function ProjectsSection({ initialProjects = [] }: ProjectsSectionProps) {
    const tHeader = useTranslations('Header');
    const tHome = useTranslations('HomePage');
    const locale = useLocale() as 'en' | 'fr';
    const [projects, setProjects] = useState<ProjectApiShape[]>(initialProjects);
    const [loading, setLoading] = useState(initialProjects.length === 0);

    useEffect(() => {
        if (initialProjects.length > 0) return;

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
    }, [initialProjects.length]);

    const statusColors = {
        "Live": "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
        "Beta": "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
        "In Development": "bg-brand-50 text-brand-800 border-brand-200",
        "Prototype": "bg-card text-secondary border-default",
        "Archived": "bg-card-muted text-muted border-default"
    };

    return (
        <section id="projects" className="scroll-mt-16 bg-paper px-6 py-20 lg:py-24">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="mb-10 max-w-xl">
                    <h2 className="section-title text-primary">{tHeader('projects')}</h2>
                    <p className="mt-3 text-[17px] leading-[1.6] text-secondary">{tHome('projects_intro')}</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-default border-t-brand-600" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-default bg-card px-6 py-10 text-[16px] text-secondary">
                        {tHome('no_projects')}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <article key={project._id} className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-default bg-card shadow-card transition-[border-color,box-shadow] duration-200 hover:border-brand-300 hover:shadow-elevated">
                                <Link href={`/projects/${project._id}`} className="absolute inset-0 z-0 rounded-xl" aria-label={project.title[locale]} />

                                <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-default bg-brand-50">
                                    {project.imageUrl ? (
                                        <Image
                                            src={project.imageUrl}
                                            alt={project.title[locale]}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex h-full items-end p-5">
                                            <span className="font-display text-[26px] leading-tight text-brand-800">{project.title[locale]}</span>
                                        </div>
                                    )}
                                    {project.status ? (
                                        <span className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 text-[12px] font-medium ${statusColors[project.status as keyof typeof statusColors] || statusColors['Live']}`}>
                                            {project.status}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="text-[18px] font-semibold leading-snug text-primary transition-colors duration-[160ms] group-hover:text-brand-700">
                                        {project.title[locale]}
                                    </h3>
                                    <p className="mt-2 line-clamp-3 text-[15px] leading-[1.6] text-secondary">
                                        {project.description[locale]}
                                    </p>

                                    {project.techStack.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {project.techStack.map((tech) => (
                                                <span key={tech} className="rounded-md bg-card-muted px-2 py-0.5 font-mono text-[12px] text-secondary">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {(project.githubUrl || project.discoveryUrl) && (
                                        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-default bg-card px-3 text-[14px] font-medium text-primary transition-colors duration-[160ms] hover:bg-card-muted"
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
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-50 px-3 text-[14px] font-medium text-brand-700 transition-colors duration-[160ms] hover:bg-brand-100"
                                                >
                                                    {discoveryLinkLabel(project.discoveryUrl, locale)}
                                                    <span aria-hidden>→</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
