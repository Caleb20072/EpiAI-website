'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { Plus, FolderOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResourceWithDetails } from '@/lib/resources/types';

export default function MyResourcesPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, userId } = useAuth();
  const t = useTranslations('Resources');

  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/${userId}/resources`);
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        }
      } catch (error) {
        console.error('Error fetching user resources:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchResources();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Sign In Required
        </h1>
        <p className="text-white/60 mb-6">
          You need to be signed in to view your resources.
        </p>
        <Link
          href={`/${locale}/sign-in`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('myResources')}</h1>
          <p className="text-white/60">
            {resources.length} {resources.length === 1 ? 'resource' : 'resources'} uploaded
          </p>
        </div>
        <Link
          href={`/${locale}/resources/new`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('addResource')}
        </Link>
      </div>

      {/* Resources Grid */}
      <ResourceGrid resources={resources} isLoading={isLoading} />
    </div>
  );
}
