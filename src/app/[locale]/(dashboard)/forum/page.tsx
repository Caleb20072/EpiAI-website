'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThreadList } from '@/components/forum/ThreadList';
import { CategoryFilter } from '@/components/forum/CategoryFilter';
import { SearchBar } from '@/components/forum/SearchBar';
import type { ThreadWithAuthor, PaginatedResponse } from '@/lib/forum/types';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, FilterBar } from '@/components/ui';

export default function ForumPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const t = useTranslations('Forum');

  const { hasPermission } = useAuth();
  const [, startTransition] = useTransition();

  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') as 'latest' | 'oldest' | 'popular') || 'latest';

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
        if (!response.ok) throw new Error('Failed to fetch');
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
      <PageHeader
        title={t('title')}
        description={`${total} ${total === 1 ? t('discussionSingular') : t('discussionPlural')}`}
        actions={
          canCreateThread ? (
            <Link href={`/${locale}/forum/new`}>
              <Button>
                <Plus className="w-5 h-5" />
                {t('newThread')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar placeholder={t('searchPlaceholder')} />
        </div>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as 'latest' | 'oldest' | 'popular')}
          className="px-4 py-2.5 rounded-xl bg-card border border-default text-primary focus-ring"
        >
          <option value="latest">{t('sortLatest')}</option>
          <option value="oldest">{t('sortOldest')}</option>
          <option value="popular">{t('sortPopular')}</option>
        </select>
      </div>

      <FilterBar>
        <CategoryFilter />
      </FilterBar>

      <ThreadList threads={threads} isLoading={isLoading} />

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
              className={`w-10 h-10 rounded-xl font-medium transition-all border ${
                page === currentPage
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-card text-primary hover:bg-card-muted border-default'
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
