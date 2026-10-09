export type EventCopy = {
  title: string;
  description: string;
  content: string;
  titleEn?: string | null;
  titleFr?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  contentEn?: string | null;
  contentFr?: string | null;
};

export function eventField(
  event: EventCopy,
  locale: string,
  field: 'title' | 'description' | 'content',
): string {
  const localized = locale === 'en' ? event[`${field}En`] : event[`${field}Fr`];
  const text = localized?.trim();
  return text || event[field] || '';
}
