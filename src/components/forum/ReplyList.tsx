'use client';

import type { ReplyWithAuthor } from '@/lib/forum/types';
import { formatDistanceToNow } from '@/lib/forum/utils';
import { cn } from '@/lib/utils/cn';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';

interface ReplyListProps {
  replies: ReplyWithAuthor[];
  onDeleteReply?: (replyId: string) => void;
  className?: string;
}

export function ReplyList({ replies, onDeleteReply, className }: ReplyListProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { userId, isAdmin } = useAuth();

  if (replies.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/50">No replies yet. Be the first to respond!</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {replies.map((reply, index) => {
        const isAuthor = userId === reply.authorId;
        const canDelete = isAuthor || isAdmin;

        return (
          <div
            key={reply.id}
            className={cn(
              'p-5 rounded-2xl bg-white/5 border border-white/10',
              index === 0 && 'mt-4'
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {reply.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{reply.authorName}</p>
                  <p className="text-white/40 text-sm">
                    {formatDistanceToNow(reply.createdAt, locale as 'en' | 'fr')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {canDelete && (
                <button
                  onClick={() => onDeleteReply?.(reply.id)}
                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete reply"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="pl-12">
              <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {reply.content}
              </div>

              {/* Edited badge */}
              {reply.isEdited && (
                <div className="flex items-center gap-1 mt-3 text-white/40 text-xs">
                  <Edit className="w-3 h-3" />
                  <span>edited</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
