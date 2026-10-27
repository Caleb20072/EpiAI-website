export const CONTRACT_VERSION = '2026-10';

export const MONTHLY_FEE_FCFA = 1500;
export const LATE_FEE_FCFA = 500;

export const CONTRACT_CLAUSES_FR = [
  "Je m'engage à payer la cotisation mensuelle de l'association : 1 500 FCFA.",
  "Les retards ne sont pas autorisés. Un retard entraîne une pénalité de 500 FCFA, visible sur mon espace.",
  "Toute absence doit être demandée à l'avance. Sans permission, elle compte comme une absence.",
  "Les absences répétées et les demandes de permission excessives ne sont pas acceptées.",
];

export const CONTRACT_CLAUSES_EN = [
  "I agree to pay the association's monthly membership fee: 1,500 FCFA.",
  'Late payments are not allowed. A delay incurs a 500 FCFA penalty, shown on my space.',
  'Any absence must be requested in advance. Without permission, it counts as an absence.',
  'Repeated absences and excessive permission requests are not accepted.',
];

export function contractClauses(locale: string) {
  return locale === 'en' ? CONTRACT_CLAUSES_EN : CONTRACT_CLAUSES_FR;
}

export function dueStatusLabel(status: string, locale: string) {
  const fr = locale !== 'en';
  if (status === 'paid') return fr ? 'payée' : 'paid';
  if (status === 'late') return fr ? 'en retard' : 'late';
  if (status === 'unpaid') return fr ? 'impayée' : 'unpaid';
  return status;
}
