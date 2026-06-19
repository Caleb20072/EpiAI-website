import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import Footer from '@/components/Footer';
import TeamSection from '@/components/TeamSection';
import { getTeamMembersForDisplay } from '@/lib/team/repository';

export default async function TeamPage() {
  const locale = (await getLocale()) as 'fr' | 'en';
  const teamMembers = await getTeamMembersForDisplay();

  return (
    <div className="relative min-h-screen text-white font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image
          src="/assets/hero-bg.jpg"
          alt=""
          fill
          quality={100}
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>
      <main className="pt-20">
        <TeamSection initialMembers={teamMembers} locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
