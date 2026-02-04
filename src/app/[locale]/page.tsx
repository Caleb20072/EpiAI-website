import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import ProblemSection from '@/components/ProblemSection';
import MissionSection from '@/components/MissionSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import ImpactSection from '@/components/ImpactSection';
import TeamSection from '@/components/TeamSection';
import ProjectsSection from '@/components/ProjectsSection';
import JoinSection from '@/components/JoinSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="relative font-[family-name:var(--font-geist-sans)] text-white overflow-x-hidden scroll-smooth">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/assets/hero-bg.jpg"
          alt="Background"
          fill
          className="object-cover brightness-[0.3]"
          priority
          quality={100}
        />
      </div>

      <main className="flex flex-col">
        <HeroSection />
        <ProblemSection />
        <MissionSection />
        <ExpertiseSection />
        <ImpactSection />
        <TeamSection />
        <ProjectsSection />
        <JoinSection />
      </main>

      <Footer />
    </div>
  );
}
