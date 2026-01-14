'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ReplyForm } from '@/components/forum/ReplyForm';
import { ReplyList } from '@/components/forum/ReplyList';
import { formatDate, formatDistanceToNow } from '@/lib/forum/utils';
import type { ThreadWithAuthor, ReplyWithAuthor } from '@/lib/forum/types';
import { ArrowLeft, MessageSquare, Eye, Clock, Pin, Lock, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CATEGORIES, TAGS } from '@/lib/forum/categories';
import {
  MessageSquare as MsgIcon,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  MessageSquare: MsgIcon,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
};

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const threadId = params.id as string;

  const { isSignedIn, userId, isAdmin, hasPermission } = useAuth();
  const t = useTranslations('Forum');

  const [isPending, startTransition] = useTransition();
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null);
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch thread
  useEffect(() => {
    async function fetchThread() {
      try {
        const response = await fetch(`/api/forum/threads?id=${threadId}`);
        if (!response.ok) {
          throw new Error('Thread not found');
        }
        const data = await response.json();
        setThread(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchThread();
  }, [threadId]);

  // Fetch replies
  useEffect(() => {
    if (!thread) return;

    async function fetchReplies() {
      try {
        const response = await fetch(`/api/forum/replies?threadId=${threadId}`);
        const data = await response.json();
        setReplies(data.data || []);
      } catch (err) {
        console.error('Error fetching replies:', err);
      }
    }

    fetchReplies();
  }, [thread, threadId]);

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/forum/threads?id=${threadId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete');

        router.push(`/${locale}/forum`);
      } catch (err) {
        alert('Failed to delete thread');
      }
    });
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      const response = await fetch(`/api/forum/replies?id=${replyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReplies(replies.filter(r => r.id !== replyId));
      }
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  const handleReplySuccess = () => {
    // Refetch replies
    async function fetchReplies() {
      try {
        const response = await fetch(`/api/forum/replies?threadId=${threadId}`);
        const data = await response.json();
        setReplies(data.data || []);
      } catch (err) {
        console.error('Error fetching replies:', err);
      }
    }
    fetchReplies();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="h-6 w-3/4 bg-white/10 rounded mb-4" />
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Thread Not Found
        </h1>
        <p className="text-white/60 mb-6">
          {error || 'This thread does not exist or has been deleted.'}
        </p>
        <Link
          href={`/${locale}/forum`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>
      </div>
    );
  }

  const Icon = iconComponents[thread.categoryId] || MsgIcon;
  const isAuthor = userId === thread.authorId;
  const canModerate = isAdmin;
  const canDelete = isAuthor || canModerate;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/${locale}/forum`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToForum')}
      </Link>

      {/* Thread Content */}
      <article className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white/10 ${thread.categoryColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{thread.title}</h1>
              <p className="text-white/50 text-sm">
                {formatDistanceToNow(thread.createdAt, locale as 'en' | 'fr')}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            {thread.isPinned && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            {thread.isLocked && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            )}
          </div>
        </div>

        {/* Author & Stats */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {thread.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white/70">{thread.authorName}</span>
          </div>
          <div className="flex items-center gap-1 text-white/50 text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>{thread.replyCount} replies</span>
          </div>
          <div className="flex items-center gap-1 text-white/50 text-sm">
            <Eye className="w-4 h-4" />
            <span>{thread.views} views</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-white/80 whitespace-pre-wrap leading-relaxed">
          {thread.content}
        </div>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-white/10 text-white/70 text-sm border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {canDelete && (
          <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
            <button
              onClick={handleDeleteThread}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isPending ? 'Deleting...' : 'Delete Thread'}
            </button>
          </div>
        )}
      </article>

      {/* Replies */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {t('replies')} ({thread.replyCount})
        </h2>
        <ReplyList replies={replies} onDeleteReply={handleDeleteReply} />
      </div>

      {/* Reply Form */}
      <ReplyForm
        threadId={threadId}
        threadLocked={thread.isLocked}
        onSuccess={handleReplySuccess}
      />
    </div>
  );
}
