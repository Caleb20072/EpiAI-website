// Format date to relative time (e.g., "2 hours ago")
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
    { label: locale === 'fr' ? 'seconde' : 'second', seconds: 1 },
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

// Format full date
export function formatDate(dateString: string, locale: 'en' | 'fr' = 'en'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// Parse tags from string (comma or space separated)
export function parseTags(tagString: string): string[] {
  return tagString
    .split(/[,\s]+/)
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 20);
}

// Validate thread title
export function validateTitle(title: string): { valid: boolean; error?: string } {
  if (!title.trim()) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length < 5) {
    return { valid: false, error: 'Title must be at least 5 characters' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  return { valid: true };
}

// Validate thread content
export function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content.trim()) {
    return { valid: false, error: 'Content is required' };
  }
  if (content.length < 10) {
    return { valid: false, error: 'Content must be at least 10 characters' };
  }
  if (content.length > 10000) {
    return { valid: false, error: 'Content must be less than 10000 characters' };
  }
  return { valid: true };
}

// Get color class for tag
export function getTagColor(tag: string): string {
  const tagColors: Record<string, string> = {
    python: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    tensorflow: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    pytorch: 'bg-red-500/20 text-red-400 border-red-500/30',
    react: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    nodejs: 'bg-green-500/20 text-green-400 border-green-500/30',
    ml: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dl: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    nlp: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  };
  return tagColors[tag.toLowerCase()] || 'bg-white/10 text-white/70 border-white/20';
}
