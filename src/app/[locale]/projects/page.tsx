import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Image from 'next/image';

export default function Projects() {
  const t = useTranslations('Header');

  return (
    <div className="relative min-h-screen text-white font-[family-name:var(--font-geist-sans)]">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image
          src="/assets/hero-bg.jpg"
          alt="Background"
          fill
          quality={100}
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>
      <Header />
      <main className="pt-32 px-4 max-w-7xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">{t('projects')}</h1>
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-xl text-gray-300">Content coming soon...</p>
        </div>
      </main>
    </div>
  );
}
