'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { DifficultyBadge } from '@/components/resources/DifficultyBadge';
import { formatFileSize, formatDistanceToNow, formatDate, getTypeLabel, getDifficultyInfo } from '@/lib/resources/utils';
import { cn } from '@/lib/utils/cn';
import {
  ArrowLeft,
  Eye,
  Download,
  ExternalLink,
  Calendar,
  User,
  Tag,
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ResourceWithDetails } from '@/lib/resources/types';

const iconComponents: Record<string, any> = {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
};

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const resourceId = params.id as string;
  const t = useTranslations('Resources');

  const { isSignedIn, hasPermission, userId } = useAuth();
  const [resource, setResource] = useState<ResourceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchResource() {
      try {
        const response = await fetch(`/api/resources/${resourceId}`);
        if (!response.ok) {
          throw new Error('Resource not found');
        }
        const data = await response.json();
        setResource(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResource();
  }, [resourceId]);

  const handleDownload = async () => {
    if (!resource) return;

    // Increment download count
    try {
      await fetch(`/api/resources/${resourceId}/download`, { method: 'POST' });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }

    // Open the file URL
    window.open(resource.fileUrl || resource.url, '_blank');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      router.push(`/${locale}/resources`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource?.title,
        text: resource?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-white/10 rounded" />
        <div className="h-12 w-3/4 bg-white/10 rounded" />
        <div className="h-6 w-1/2 bg-white/10 rounded" />
        <div className="h-48 bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold text-white mb-4">Resource not found</h2>
        <Link
          href={`/${locale}/resources`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to resources
        </Link>
      </div>
    );
  }

  const TypeIcon = iconComponents[resource.type] || FileText;
  const difficultyInfo = getDifficultyInfo(resource.difficulty, locale as 'en' | 'fr');
  const canEdit = userId === resource.createdBy || hasPermission('resources.manage');

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/${locale}/resources`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToResources')}
      </Link>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-4 rounded-xl flex-shrink-0',
                getTypeColor(resource.type)
              )}>
                <TypeIcon className="w-8 h-8" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {resource.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm">
                    {getTypeLabel(resource.type, locale as 'en' | 'fr')}
                  </span>
                  <DifficultyBadge
                    difficulty={resource.difficulty}
                    locale={locale as 'en' | 'fr'}
                  />
                  {resource.isFeatured && (
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-white/70 whitespace-pre-wrap">
                  {resource.description}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                {t('tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
              >
                <Download className="w-5 h-5" />
                {resource.fileUrl ? t('downloadFile') : t('openLink')}
              </button>

              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
              >
                <Share2 className="w-5 h-5" />
                {t('share')}
              </button>

              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/${locale}/resources/${resource.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    {t('edit')}
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">{t('stats')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t('views')}
                </span>
                <span className="text-white font-medium">{resource.viewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('downloads')}
                </span>
                <span className="text-white font-medium">{resource.downloadCount}</span>
              </div>
              {resource.fileSize && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60">{t('fileSize')}</span>
                  <span className="text-white font-medium">{formatFileSize(resource.fileSize)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Meta Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">{t('information')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white/60 text-sm">{t('createdAt')}</p>
                  <p className="text-white">{formatDate(resource.createdAt, locale as 'en' | 'fr')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white/60 text-sm">{t('author')}</p>
                  <p className="text-white">{resource.author || t('anonymous')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white/60 text-sm">{t('category')}</p>
                  <p className="text-white">{resource.categoryName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500/20 text-red-400',
    code: 'bg-blue-500/20 text-blue-400',
    video: 'bg-purple-500/20 text-purple-400',
    article: 'bg-emerald-500/20 text-emerald-400',
    course: 'bg-amber-500/20 text-amber-400',
    dataset: 'bg-cyan-500/20 text-cyan-400',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
}
