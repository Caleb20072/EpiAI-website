'use client';

import type { EventWithDetails } from '@/lib/events/types';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  Wrench,
  Mic2,
  Code2,
  Users2,
  GraduationCap,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  Wrench,
  Mic2,
  Code2,
  Users: Users2,
  GraduationCap,
};

interface EventCardProps {
  event: EventWithDetails;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const Icon = iconComponents[event.categoryIcon] || Calendar;
  const isFull = event.spotsLeft <= 0;
  const spotsPercentage = (event.registeredCount / event.capacity) * 100;

  return (
    <div
      className={cn(
        'group rounded-2xl bg-white/5 border border-white/10 overflow-hidden',
        'hover:bg-white/10 hover:border-white/20 transition-all duration-300',
        className
      )}
    >
      {/* Image */}
      {event.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20">
            <Icon className={cn('w-4 h-4', event.categoryColor)} />
            <span className="text-white text-sm font-medium">{event.categoryName}</span>
          </div>
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-white/90 transition-colors">
          {event.title}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-sm text-white/60">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {event.isOnline ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[120px]">{event.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-white/60">
              <Users className="w-4 h-4" />
              <span>{event.registeredCount} / {event.capacity}</span>
            </div>
            <span className={cn(
              'font-medium text-sm',
              isFull ? 'text-red-400' : 'text-emerald-400'
            )}>
              {event.spotsLeft} spots left
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                spotsPercentage >= 90 ? 'bg-red-500' :
                spotsPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(100, spotsPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
