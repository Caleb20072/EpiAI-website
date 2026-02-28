'use client';

import type { EventWithDetails } from '@/lib/events/types';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils/cn';
import { Calendar } from 'lucide-react';

interface EventListProps {
  events: EventWithDetails[];
  isLoading?: boolean;
  className?: string;
}

export function EventList({ events: eventsProp, isLoading, className }: EventListProps) {
  const events = eventsProp ?? [];
  if (isLoading) {
    return (
      <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/5 border border-white/10 animate-pulse"
          >
            <div className="h-48 bg-white/10" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'rounded-2xl bg-white/5 border border-white/10',
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No events found
        </h3>
        <p className="text-white/60 text-center max-w-sm">
          There are no upcoming events at the moment. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
