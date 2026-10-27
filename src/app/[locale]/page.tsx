import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/seo';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import MissionSection from '@/components/MissionSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import ImpactSection from '@/components/ImpactSection';
import TeamSection from '@/components/TeamSection';
import ProjectsSection from '@/components/ProjectsSection';
import EventsSection from '@/components/EventsSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';
import { getTeamMembersForDisplay } from '@/lib/team/repository';
import { getProjects } from '@/lib/projects/repository';
import { getPublicEvents } from '@/lib/events/repository';

/** Toujours rendu à la demande — nécessite DATABASE_URL (Neon) au runtime Netlify */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale === 'fr';
  return buildPageMetadata({
    locale,
    path: '',
    title: fr
      ? "Epi'AI — Association IA et data science | Epitech"
      : "Epi'AI — AI and data science student association | Epitech",
    description: fr
      ? "Association étudiante Epitech dédiée aux mathématiques, à l'intelligence artificielle et à la data science. Projets, talks, formation et communauté."
      : 'Epitech student association for mathematics, artificial intelligence and data science. Projects, talks, training and community.',
  });
}

export default async function Home() {
  const locale = (await getLocale()) as 'fr' | 'en';
  const [teamMembers, projects, events] = await Promise.all([
    getTeamMembersForDisplay().catch(() => []),
    getProjects(true).catch(() => []),
    getPublicEvents(6).catch(() => []),
  ]);

  const nextEvent =
    events
      .filter((e) => !e.isPast)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: "Epi'AI",
        url: 'https://epiai.eu',
        logo: 'https://epiai.eu/assets/epiai-logo.png',
        description:
          locale === 'fr'
            ? "Association étudiante Epitech dédiée aux mathématiques, à l'intelligence artificielle et à la data science."
            : 'Epitech student association for mathematics, artificial intelligence and data science.',
      },
      {
        '@type': 'WebSite',
        name: "Epi'AI",
        url: 'https://epiai.eu',
        inLanguage: ['fr', 'en'],
      },
    ],
  };

  return (
    <div className="relative overflow-x-hidden bg-paper text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex flex-col">
        <HeroSection nextEvent={nextEvent} />
        <ProblemSection />
        <MissionSection />
        <ExpertiseSection />
        <ImpactSection />
        <TeamSection initialMembers={teamMembers} locale={locale} />
        <ProjectsSection initialProjects={projects} />
        <EventsSection initialEvents={events} />
        <JoinSection />
      </main>

      <Footer />
    </div>
  );
}
