import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/about',
    title: locale === 'fr' ? "À propos d'Epi'AI" : "About Epi'AI",
    description:
      locale === 'fr'
        ? "Epi'AI est l'association étudiante Epitech dédiée à l'IA, aux maths et à la data science."
        : "Epi'AI is the Epitech student association for AI, maths and data science.",
  });
}

export default function About() {
  const t = useTranslations('About');

  return (
    <div className="paper-page min-h-screen overflow-hidden">

      <main className="pt-24 sm:pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light">
              {t('intro')}
            </p>
          </div>

          {/* Grid Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Motivation */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-brand-300">{t('motivation_title')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('motivation_text')}
              </p>
            </div>

            {/* Card 2: Approach */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-brand-300">{t('approach_title')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('approach_text')}
              </p>
            </div>

            {/* Card 3: Impact */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-cyan-300">{t('impact_title')}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t('impact_text')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
