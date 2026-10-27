import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import TeamSection from '@/components/TeamSection';
import { getTeamMembersForDisplay } from '@/lib/team/repository';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/team',
    title: locale === 'fr' ? "L'équipe Epi'AI" : "The Epi'AI team",
    description:
      locale === 'fr'
        ? "Bureau, référents et pôles de l'association Epi'AI à Epitech."
        : "Board, referents and poles of the Epi'AI association at Epitech.",
  });
}

export default async function TeamPage() {
  const locale = (await getLocale()) as 'fr' | 'en';
  const teamMembers = await getTeamMembersForDisplay().catch(() => []);

  return (
    <div className="min-h-screen bg-card text-primary overflow-x-hidden">
      <main className="pt-20">
        <TeamSection initialMembers={teamMembers} locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
