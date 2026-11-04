import type { ICategory } from './types';

/**
 * Séries publiques « Epi'AI Special Talks ».
 * Les anciens ids (workshop, conference…) sont mappés via LEGACY_CATEGORY_MAP.
 */
export const CATEGORIES: ICategory[] = [
  {
    id: 'women-shaping-tech',
    slug: 'women-shaping-tech',
    name: { en: 'Women Shaping Tech', fr: 'Women Shaping Tech' },
    description: {
      en: 'Careers and leadership of women in AI.',
      fr: 'Parcours et leadership des femmes dans l’IA.',
    },
    icon: 'Sparkles',
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
  },
  {
    id: 'ai-leaders',
    slug: 'ai-leaders',
    name: { en: 'AI Leaders Talks', fr: 'AI Leaders Talks' },
    description: {
      en: 'Conversations with AI professionals and decision-makers.',
      fr: 'Échanges avec des professionnels et décideurs de l’IA.',
    },
    icon: 'Mic2',
    color: 'text-brand-400',
    bgColor: 'bg-brand-400/10',
  },
  {
    id: 'research',
    slug: 'research',
    name: { en: 'Research Talks', fr: 'Research Talks' },
    description: {
      en: 'Conversations with AI researchers and PhD students.',
      fr: 'Échanges avec des chercheurs et doctorants en IA.',
    },
    icon: 'FlaskConical',
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/10',
  },
  {
    id: 'builders',
    slug: 'builders',
    name: { en: 'Builders Talks', fr: 'Builders Talks' },
    description: {
      en: 'Entrepreneurs and engineers building concrete AI solutions.',
      fr: 'Entrepreneurs et ingénieurs qui construisent des solutions concrètes en IA.',
    },
    icon: 'Hammer',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  {
    id: 'masterclass',
    slug: 'masterclass',
    name: { en: 'MasterClass', fr: 'MasterClass' },
    description: {
      en: 'In-depth sessions to learn, practice and go further.',
      fr: 'Sessions approfondies pour apprendre, pratiquer et aller plus loin.',
    },
    icon: 'GraduationCap',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
];

/** Anciennes catégories → nouvelles séries Special Talks */
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  workshop: 'builders',
  conference: 'ai-leaders',
  hackathon: 'builders',
  meetup: 'ai-leaders',
  formation: 'masterclass',
};

export function resolveCategoryId(raw: string | null | undefined): string {
  if (!raw) return 'ai-leaders';
  if (CATEGORIES.some((c) => c.id === raw)) return raw;
  return LEGACY_CATEGORY_MAP[raw] || 'ai-leaders';
}

export function getCategory(id: string | null | undefined): ICategory {
  const resolved = resolveCategoryId(id);
  return CATEGORIES.find((c) => c.id === resolved) || CATEGORIES[1]!;
}

export const SPECIAL_TALKS = {
  brand: "Epi'AI Special Talks",
  tagline: {
    en: "Conversations with the people shaping tomorrow's technology.",
    fr: "Conversations with the people shaping tomorrow's technology.",
  },
} as const;
