export const PARIS_TZ = 'Europe/Paris';

export function formatParis(date: Date, locale: 'fr' | 'en' = 'fr') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    timeZone: PARIS_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function examWindow(startsAt: Date, durationMinutes: number) {
  const openAt = new Date(startsAt.getTime() - 10 * 60 * 1000);
  const closeAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  return { openAt, closeAt };
}

export function nowMs() {
  return Date.now();
}
