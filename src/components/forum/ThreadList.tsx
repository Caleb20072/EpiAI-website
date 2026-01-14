'use client';

import type { ThreadWithAuthor } from '@/lib/forum/types';
import { ThreadCard } from './ThreadCard';
import { cn } from '@/lib/utils/cn';
import { MessageSquare } from 'lucide-react';

interface ThreadListProps {
  threads: ThreadWithAuthor[];
  isLoading?: boolean;
  className?: string;
}

export function ThreadList({ threads, isLoading, className }: ThreadListProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/10 rounded" />
                  <div className="h-6 w-16 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'rounded-2xl bg-white/5 border border-white/10',
        className
      )}>
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No discussions yet
        </h3>
        <p className="text-white/60 text-center max-w-sm">
          Be the first to start a discussion in this category!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
