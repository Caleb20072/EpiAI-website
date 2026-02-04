// Format relative time
export function formatDistanceToNow(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
    { label: locale === 'fr' ? 'an' : 'year', seconds: 31536000 },
    { label: locale === 'fr' ? 'mois' : 'month', seconds: 2592000 },
    { label: locale === 'fr' ? 'semaine' : 'week', seconds: 604800 },
    { label: locale === 'fr' ? 'jour' : 'day', seconds: 86400 },
    { label: locale === 'fr' ? 'heure' : 'hour', seconds: 3600 },
    { label: locale === 'fr' ? 'minute' : 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      if (locale === 'fr') {
        return `il y a ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
      return `${count} ${interval.label}${count > 1 ? 's' : ' ago'}`;
    }
  }

  return locale === 'fr' ? 'a l\'instant' : 'just now';
}

// Format date
export function formatDate(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
