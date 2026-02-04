'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { EventList } from '@/components/events/EventList';
import { CategoryFilter } from '@/components/events/CategoryFilter';
import type { EventWithDetails, PaginatedResponse } from '@/lib/events/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

export default function PastEventsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('Events');
  const [isPending, startTransition] = useTransition();

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';

  // Fetch past events
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '9');
        queryParams.set('past', 'true');
        if (selectedCategory) queryParams.set('category', selectedCategory);

        const response = await fetch(`/api/events?${queryParams.toString()}`);
        const data: PaginatedResponse<EventWithDetails> = await response.json();

        setEvents(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [currentPage, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('pastEvents')}</h1>
          <p className="text-white/60">
            {total} {total === 1 ? 'event' : 'events'} from the past
          </p>
        </div>
        <Link
          href={`/${locale}/events`}
          className="px-4 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
        >
          {t('upcoming')}
        </Link>
      </div>

      {/* Category Filter */}
      <CategoryFilter />

      {/* Event List */}
      <EventList events={events} isLoading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                startTransition(() => {
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.set('page', page.toString());
                  router.push(`/${locale}/events/past?${newParams.toString()}`);
                });
              }}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${
                page === currentPage
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
