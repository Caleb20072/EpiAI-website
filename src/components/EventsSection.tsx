'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Calendar, MapPin, Globe } from 'lucide-react';
import type { EventWithDetails } from '@/lib/events/types';
import { EventCoverImage } from '@/components/events/EventCoverImage';
import { formatDate } from '@/lib/utils/date';

interface EventsSectionProps {
  initialEvents?: EventWithDetails[];
}

export default function EventsSection({ initialEvents = [] }: EventsSectionProps) {
  const locale = useLocale() as 'en' | 'fr';
  const fr = locale === 'fr';
  const events = initialEvents;

  return (
    <section
      id="events"
      className="tile-canvas py-20 px-6"
    >

      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-semibold mb-3 text-[#1d1d1f]">
            {fr ? 'Événements' : 'Events'}
          </h2>
          <p className="text-[#333] max-w-xl mx-auto text-[17px]">
            {fr
              ? 'Talks, workshops et rencontres organisés par Epi’AI — ouverts à tous.'
              : 'Talks, workshops and meetups organized by Epi’AI — open to everyone.'}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-[#7a7a7a]">
              {fr ? 'Aucun événement public pour le moment' : 'No public events yet'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <article
                key={event.id}
                className="group relative rounded-[18px] bg-white border border-[#e0e0e0] overflow-hidden flex flex-col h-full"
              >
                <Link
                  href={`/calendar/${event.id}`}
                  className="absolute inset-0 z-0"
                  aria-label={event.title}
                />

                <div className="h-48 relative w-full border-b border-white/5 overflow-hidden">
                  <EventCoverImage
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full"
                    imgClassName="opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  {event.isPast ? (
                    <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20 bg-black/50 text-white/80 backdrop-blur-md">
                      {fr ? 'Passé' : 'Past'}
                    </span>
                  ) : null}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-[17px] font-semibold mb-2 text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-[14px] text-[#7a7a7a] mb-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(event.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {event.isOnline ? (
                        <Globe className="w-3.5 h-3.5" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5" />
                      )}
                      <span className="truncate max-w-[160px]">
                        {event.isOnline
                          ? fr
                            ? 'En ligne'
                            : 'Online'
                          : event.location}
                      </span>
                    </span>
                  </div>
                  <p className="text-[#333] leading-[1.47] text-[17px] line-clamp-3 mt-auto">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12 relative z-10">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-2 text-[17px] text-[#0066cc]"
          >
            {fr ? 'Voir tout le calendrier' : 'View full calendar'}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
