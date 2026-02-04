'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { SearchBar } from '@/components/resources/SearchBar';
import { CategoryFilter } from '@/components/resources/CategoryFilter';
import { TypeFilter } from '@/components/resources/TypeFilter';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResourceWithDetails, PaginatedResponse } from '@/lib/resources/types';

export default function ResourcesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('Resources');

  const { isSignedIn, hasPermission } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const selectedType = searchParams.get('type') || '';
  const selectedDifficulty = searchParams.get('difficulty') || '';
  const searchQuery = searchParams.get('search') || '';

  // Fetch resources
  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', '12');
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (selectedType) queryParams.set('type', selectedType);
        if (selectedDifficulty) queryParams.set('difficulty', selectedDifficulty);
        if (searchQuery) queryParams.set('search', searchQuery);

        const response = await fetch(`/api/resources?${queryParams.toString()}`);
        const data: PaginatedResponse<ResourceWithDetails> = await response.json();

        setResources(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, [currentPage, selectedCategory, selectedType, selectedDifficulty, searchQuery]);

  const canCreateResource = hasPermission('resources.create');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-white/60">
            {total} {total === 1 ? 'resource' : 'resources'}
          </p>
        </div>
        {canCreateResource && (
          <Link
            href={`/${locale}/resources/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('addResource')}
          </Link>
        )}
      </div>

      {/* Search */}
      <SearchBar placeholder={t('searchPlaceholder')} />

      {/* Filters */}
      <div className="space-y-4">
        <CategoryFilter />
        <TypeFilter />
      </div>

      {/* Resources Grid */}
      <ResourceGrid resources={resources} isLoading={isLoading} />

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
                  router.push(`/${locale}/resources?${newParams.toString()}`);
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
