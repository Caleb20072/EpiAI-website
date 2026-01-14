'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { EventList } from '@/components/events/EventList';
import { CategoryFilter } from '@/components/events/CategoryFilter';
import { formatDate } from '@/lib/events/utils';
import type { EventWithDetails, PaginatedResponse } from '@/lib/events/types';
import { Plus, Filter, SortDesc, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function EventsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, hasPermission } = useAuth();
  const t = useTranslations('Events');

  const [isPending, startTransition] = useTransition();

  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const showPast = searchParams.get('past') === 'true';

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '9');
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (showPast) queryParams.set('past', 'true');

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
  }, [currentPage, selectedCategory, showPast]);

  const canCreateEvent = hasPermission('dashboard.admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-white/60">
            {total} {total === 1 ? 'event' : 'events'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              startTransition(() => {
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.set('past', showPast ? 'false' : 'true');
                router.push(`/${locale}/events?${newParams.toString()}`);
              });
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showPast
                ? 'bg-white text-black'
                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {showPast ? t('upcoming') : t('past')}
          </button>
          {canCreateEvent && (
            <Link
              href={`/${locale}/events/new`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('createEvent')}
            </Link>
          )}
        </div>
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
                  router.push(`/${locale}/events?${newParams.toString()}`);
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
