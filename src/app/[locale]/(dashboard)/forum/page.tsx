'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThreadList } from '@/components/forum/ThreadList';
import { CategoryFilter } from '@/components/forum/CategoryFilter';
import { SearchBar } from '@/components/forum/SearchBar';
import { formatDate } from '@/lib/forum/utils';
import type { ThreadWithAuthor, PaginatedResponse } from '@/lib/forum/types';
import { Plus, Filter, SortDesc } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ForumPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('Forum');

  const { isSignedIn, hasPermission } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') as 'latest' | 'oldest' | 'popular') || 'latest';

  // Fetch threads
  useEffect(() => {
    async function fetchThreads() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '10');
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (selectedTag) queryParams.set('tag', selectedTag);
        if (searchQuery) queryParams.set('search', searchQuery);
        queryParams.set('sort', sortBy);

        const response = await fetch(`/api/forum/threads?${queryParams.toString()}`);
        const data: PaginatedResponse<ThreadWithAuthor> = await response.json();

        setThreads(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchThreads();
  }, [currentPage, selectedCategory, selectedTag, searchQuery, sortBy]);

  const handleSortChange = (sort: 'latest' | 'oldest' | 'popular') => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('sort', sort);
      router.push(`/${locale}/forum?${newParams.toString()}`);
    });
  };

  const canCreateThread = hasPermission('content.create');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-white/60">
            {total} {total === 1 ? 'discussion' : 'discussions'}
          </p>
        </div>
        {canCreateThread && (
          <Link
            href={`/${locale}/forum/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('newThread')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar placeholder={t('searchPlaceholder')} />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
          >
            <option value="latest" className="bg-zinc-900">{t('sortLatest')}</option>
            <option value="oldest" className="bg-zinc-900">{t('sortOldest')}</option>
            <option value="popular" className="bg-zinc-900">{t('sortPopular')}</option>
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter />

      {/* Thread List */}
      <ThreadList threads={threads} isLoading={isLoading} />

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
                  router.push(`/${locale}/forum?${newParams.toString()}`);
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
