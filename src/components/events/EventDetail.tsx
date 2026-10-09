'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { EventWithDetails } from '@/lib/events/types';
import { CATEGORIES } from '@/lib/events/categories';
import { eventField, eventLocation } from '@/lib/events/locale';
import { formatDate, getSpotsPercentage, getProgressColor } from '@/lib/events/utils';
import { cn } from '@/lib/utils/cn';
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Wrench,
  Mic2,
  Code2,
  Users2,
  GraduationCap,
  ExternalLink,
  Expand,
} from 'lucide-react';
import { EventCoverImage } from './EventCoverImage';
import { ImageLightbox } from './ImageLightbox';

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Mic2,
  Code2,
  Users: Users2,
  GraduationCap,
};

interface EventDetailProps {
  event: EventWithDetails;
  className?: string;
  /** Hide capacity / registration counts (public marketing pages) */
  showRegistrationStats?: boolean;
}

export function EventDetail({
  event,
  className,
  showRegistrationStats = true,
}: EventDetailProps) {
  const locale = useLocale();
  const t = useTranslations('EventDetail');
  const Icon = iconComponents[event.categoryIcon] || Calendar;
  const spotsPercentage = getSpotsPercentage(event.registeredCount, event.capacity);
  const isFull = event.spotsLeft <= 0;
  const title = eventField(event, locale, 'title');
  const description = eventField(event, locale, 'description');
  const content = eventField(event, locale, 'content');
  const category = CATEGORIES.find((item) => item.id === event.categoryId);
  const categoryName = category ? category.name[locale === 'en' ? 'en' : 'fr'] : event.categoryName;

  const lightboxImages = useMemo(() => {
    const cover = event.imageUrl ? [event.imageUrl] : [];
    const gallery = event.gallery || [];
    // Avoid duplicating cover if it's already first in gallery
    const rest = gallery.filter((u) => u !== event.imageUrl);
    return [...cover, ...rest];
  }, [event.imageUrl, event.gallery]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = (src: string) => {
    const i = lightboxImages.indexOf(src);
    if (i >= 0) setLightboxIndex(i);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Image */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
        {event.imageUrl ? (
          <button
            type="button"
            onClick={() => openAt(event.imageUrl!)}
            className="absolute inset-0 z-[1] w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={t('view_cover')}
          />
        ) : null}
        <EventCoverImage
          src={event.imageUrl}
          alt={title}
          className="h-full w-full rounded-2xl pointer-events-none"
        />

        <div className="absolute top-6 left-6 z-[2] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm border border-default pointer-events-none">
          <Icon className={cn('w-5 h-5', event.categoryColor)} />
          <span className="text-primary font-medium">{categoryName}</span>
        </div>

        {event.imageUrl ? (
          <div className="absolute bottom-4 right-4 z-[2] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-xs backdrop-blur-sm">
              <Expand className="w-3.5 h-3.5" />
              {t('enlarge')}
            </span>
          </div>
        ) : null}
      </div>

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary">{title}</h1>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-4 md:gap-6">
        <div className="flex items-center gap-2 text-secondary">
          <Calendar className="w-5 h-5" />
          <span>{formatDate(event.date, locale === 'en' ? 'en' : 'fr')}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <MapPin className="w-5 h-5" />
          <span>{event.isOnline ? t('online') : eventLocation(event.location, locale)}</span>
        </div>
        {showRegistrationStats ? (
          <div className="flex items-center gap-2 text-secondary">
            <Users className="w-5 h-5" />
            <span>{t('registered', { count: event.registeredCount, capacity: event.capacity })}</span>
          </div>
        ) : null}
      </div>

      {/* Capacity Bar — members only */}
      {showRegistrationStats ? (
        <div className="p-4 rounded-xl bg-card border border-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary">{t('availability')}</span>
            <span className={cn(
              'font-medium',
              isFull ? 'text-red-400' : 'text-brand-400'
            )}>
              {t('spots', { count: event.spotsLeft })}
            </span>
          </div>
          <div className="h-3 rounded-full bg-card-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                getProgressColor(spotsPercentage)
              )}
              style={{ width: `${100 - spotsPercentage}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Online Link */}
      {event.isOnline && event.onlineLink && (
        <a
          href={event.onlineLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all border border-purple-500/30"
        >
          <Globe className="w-5 h-5" />
          <span>{t('join_online')}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {/* Description */}
      <div className="prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold text-primary mb-3">{t('about')}</h2>
        <p className="text-secondary whitespace-pre-wrap leading-relaxed">
          {description}
        </p>
      </div>

      {/* Full Content */}
      {content && (
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-semibold text-primary mb-3">{t('details')}</h2>
          <div className="text-secondary whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      )}

      {/* Gallery */}
      {event.gallery && event.gallery.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">{t('gallery')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => openAt(image)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={t('view_gallery', { index: index + 1 })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={t('view_gallery', { index: index + 1 })}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {event.videoUrls && event.videoUrls.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">{t('videos')}</h2>
          <div className="space-y-4">
            {event.videoUrls.map((url, index) => {
              const isFile = url.startsWith('/') || /\.(mp4|webm|mov)(\?|$)/i.test(url);
              return (
                <div key={url} className="rounded-xl overflow-hidden border border-default bg-card-muted">
                  {isFile ? (
                    <video src={url} controls className="w-full max-h-96 bg-black" />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-4 text-brand-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('videos')} {index + 1}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lightboxIndex !== null && lightboxImages.length > 0 ? (
        <ImageLightbox
          images={lightboxImages}
          index={lightboxIndex}
          alt={title}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}
