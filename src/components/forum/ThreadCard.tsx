'use client';

import type { ThreadWithAuthor } from '@/lib/forum/types';
import { cn } from '@/lib/utils/cn';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/forum/utils';
import {
  MessageSquare,
  Eye,
  Pin,
  Lock,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
  MessageCircle,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  MessageSquare,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
};

interface ThreadCardProps {
  thread: ThreadWithAuthor;
  className?: string;
}

export function ThreadCard({ thread, className }: ThreadCardProps) {
  const params = useParams();
  const locale = params.locale as string || 'en';

  const Icon = iconComponents[thread.categoryId] || MessageSquare;

  const timeAgo = formatDistanceToNow(thread.createdAt, locale as 'en' | 'fr');

  return (
    <Link
      href={`/${locale}/forum/${thread.id}`}
      className={cn(
        'block p-5 rounded-2xl bg-card border border-default',
        'hover:border-default hover:bg-card-muted transition-all',
        'group',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div
          className={cn(
            'p-2.5 rounded-xl bg-card-muted flex-shrink-0',
            thread.categoryColor
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with pinned/locked badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {thread.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {thread.isLocked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
            <h3 className="text-lg font-semibold text-primary group-hover:text-white/90 transition-colors line-clamp-2">
              {thread.title}
            </h3>
          </div>

          {/* Tags */}
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {thread.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg bg-card text-secondary text-xs border border-default"
                >
                  #{tag}
                </span>
              ))}
              {thread.tags.length > 3 && (
                <span className="px-2 py-0.5 rounded-lg bg-card text-muted text-xs">
                  +{thread.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-card-muted flex items-center justify-center text-xs">
                {thread.authorName.charAt(0).toUpperCase()}
              </span>
              <span>{thread.authorName}</span>
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-secondary">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{thread.replyCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{thread.views}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
