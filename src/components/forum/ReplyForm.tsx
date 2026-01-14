'use client';

import { useState, useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import { validateContent } from '@/lib/forum/utils';
import { Send } from 'lucide-react';

interface ReplyFormProps {
  threadId: string;
  threadLocked?: boolean;
  onSuccess?: () => void;
}

export function ReplyForm({ threadId, threadLocked, onSuccess }: ReplyFormProps) {
  const { isSignedIn, userId } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p className="text-white/60 mb-4">
          You need to be signed in to reply to this discussion.
        </p>
        <a
          href="/sign-in"
          className="inline-block px-6 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (threadLocked) {
    return (
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
        <p className="text-white/60">
          This discussion is locked. No new replies are allowed.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateContent(content);
    if (!validation.valid) {
      setError(validation.error || 'Invalid content');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/forum/replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId,
            content: content.trim(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to post reply');
        }

        setContent('');
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        setError(error.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* User info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-white font-medium">
            M
          </span>
        </div>
        <div>
          <p className="text-white font-medium">
            Membre
          </p>
          <p className="text-white/50 text-sm">Post a reply</p>
        </div>
      </div>

      {/* Content */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          rows={4}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/40 resize-none',
            'focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all',
            error ? 'border-red-500/50' : 'border-white/10'
          )}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold',
            'hover:bg-white/90 transition-all disabled:opacity-50',
            isPending && 'animate-pulse'
          )}
        >
          <Send className="w-4 h-4" />
          {isPending ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
