import { getLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import TeamSection from '@/components/TeamSection';
import { getTeamMembersForDisplay } from '@/lib/team/repository';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const locale = (await getLocale()) as 'fr' | 'en';
  const teamMembers = await getTeamMembersForDisplay().catch(() => []);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] overflow-x-hidden">
      <main className="pt-20">
        <TeamSection initialMembers={teamMembers} locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
