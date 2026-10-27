export const ROLE_LABELS: Record<string, { fr: string; en: string }> = {
  Président: { fr: 'Président', en: 'President' },
  'Vice-président': { fr: 'Vice-président', en: 'Vice-president' },
  'Responsable Formation': { fr: 'Responsable Formation', en: 'Head of Training' },
  'Responsable Communication': { fr: 'Responsable Communication', en: 'Head of Communications' },
  'Notre Référent': { fr: 'Notre Référent', en: 'Our Referent' },
  Membre: { fr: 'Membre', en: 'Member' },
  Mentor: { fr: 'Mentor', en: 'Mentor' },
};

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function teamRoleLabel(role: string, locale: 'fr' | 'en'): string {
  const trimmed = role.trim();
  if (!trimmed) return '';
  const direct = ROLE_LABELS[trimmed]?.[locale];
  if (direct) return direct;
  const folded = fold(trimmed);
  const match = Object.entries(ROLE_LABELS).find(
    ([key, labels]) => fold(key) === folded || fold(labels.fr) === folded || fold(labels.en) === folded,
  );
  return match ? match[1][locale] : trimmed;
}
