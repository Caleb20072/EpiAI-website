const BLOG_CATEGORIES: Record<string, { fr: string; en: string }> = {
  Events: { fr: 'Événements', en: 'Events' },
  Event: { fr: 'Événement', en: 'Event' },
  Workshop: { fr: 'Atelier', en: 'Workshop' },
  Meetup: { fr: 'Rencontre', en: 'Meetup' },
  Hackathon: { fr: 'Hackathon', en: 'Hackathon' },
  Formation: { fr: 'Formation', en: 'Training' },
};

export function localizeCategory(category: string, locale: string): string {
  const lang = locale === 'en' ? 'en' : 'fr';
  return BLOG_CATEGORIES[category]?.[lang] || category;
}

const PROJECT_STATUS: Record<string, { fr: string; en: string }> = {
  Live: { fr: 'En ligne', en: 'Live' },
  Beta: { fr: 'Bêta', en: 'Beta' },
  'In Development': { fr: 'En développement', en: 'In development' },
  Prototype: { fr: 'Prototype', en: 'Prototype' },
  Archived: { fr: 'Archivé', en: 'Archived' },
};

export function localizeProjectStatus(status: string, locale: string): string {
  const lang = locale === 'en' ? 'en' : 'fr';
  return PROJECT_STATUS[status]?.[lang] || status;
}
