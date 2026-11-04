'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SOCIAL_LINKS } from '@/lib/team/poles';

export default function WeeklySection() {
  const locale = useLocale();
  const fr = locale === 'fr';

  return (
    <section id="weekly" className="scroll-mt-16 bg-paper px-6 py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="max-w-3xl border-l-2 border-brand-600 pl-6 sm:pl-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">
            {fr ? 'Sur nos réseaux' : 'On our channels'}
          </p>
          <h2 className="section-title mt-2 text-primary">Epi’AI Weekly</h2>
          <p className="mt-4 text-[17px] leading-[1.65] text-secondary">
            {fr
              ? "Epi’AI Weekly est le rendez-vous hebdomadaire d’Epi’AI dédié à l’actualité, aux découvertes et aux avancées dans le domaine de l’intelligence artificielle."
              : "Epi’AI Weekly is Epi’AI’s weekly rendez-vous dedicated to news, discoveries and advances in artificial intelligence."}
          </p>
          <p className="mt-4 text-[17px] leading-[1.65] text-secondary">
            {fr
              ? "À travers une sélection d’informations, de recherches, d’innovations et de tendances, nous souhaitons rendre l’IA plus accessible, éveiller la curiosité et permettre à chacun de mieux comprendre les transformations technologiques en cours."
              : "Through a selection of news, research, innovations and trends, we aim to make AI more accessible, spark curiosity, and help everyone better understand the technological shifts underway."}
          </p>
          <p className="mt-5 text-[18px] font-semibold text-primary">
            {fr ? "Une semaine, l’essentiel de l’IA." : 'One week, the essentials of AI.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
            >
              LinkedIn
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
            >
              Instagram
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet"
            >
              Facebook
            </a>
            <Link href="/calendar" className="link-quiet">
              {fr ? 'Special Talks →' : 'Special Talks →'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
