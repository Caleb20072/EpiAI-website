'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CATEGORIES, TAGS } from '@/lib/forum/categories';
import { cn } from '@/lib/utils/cn';
import { validateTitle, validateContent, parseTags } from '@/lib/forum/utils';
import {
  MessageSquare,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
  X,
  Tag,
} from 'lucide-react';
import type { CreateThreadInput } from '@/lib/forum/types';

const iconComponents: Record<string, any> = {
  MessageSquare,
  Brain,
  Globe,
  Smartphone,
  Database,
  Folder,
};

interface CreateThreadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateThreadForm({ onSuccess, onCancel }: CreateThreadFormProps) {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string || 'en';

  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ title?: string; content?: string; general?: string }>({});

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      setErrors(prev => ({ ...prev, title: titleValidation.error }));
      return;
    }

    const contentValidation = validateContent(content);
    if (!contentValidation.valid) {
      setErrors(prev => ({ ...prev, content: contentValidation.error }));
      return;
    }

    if (!selectedCategory) {
      setErrors(prev => ({ ...prev, general: 'Please select a category' }));
      return;
    }

    startTransition(async () => {
      try {
        const input: CreateThreadInput = {
          title: title.trim(),
          content: content.trim(),
          categoryId: selectedCategory,
          tags: selectedTags,
        };

        const response = await fetch('/api/forum/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create thread');
        }

        const thread = await response.json();

        startTransition(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/${locale}/forum/${thread.id}`);
          }
        });
      } catch (error: any) {
        setErrors(prev => ({ ...prev, general: error.message }));
      }
    });
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput.trim().toLowerCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errors.general}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a descriptive title..."
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/40',
            'focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all',
            errors.title ? 'border-red-500/50' : 'border-white/10'
          )}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Category *
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const Icon = iconComponents[category.icon] || MessageSquare;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isSelected
                    ? 'bg-white/20 text-white border border-white/40'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                )}
              >
                <Icon className={cn('w-4 h-4', category.color)} />
                <span>{category.name[locale as 'en' | 'fr'] || category.name.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Content *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your discussion content here..."
          rows={8}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/40 resize-none',
            'focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all',
            errors.content ? 'border-red-500/50' : 'border-white/10'
          )}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-400">{errors.content}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Tags (optional, max 5)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 text-white text-sm border border-white/20"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag and press Enter..."
            disabled={selectedTags.length >= 5}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder:text-white/40',
              'focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all',
              selectedTags.length >= 5 && 'opacity-50 cursor-not-allowed'
            )}
          />
        </div>
        {/* Suggested tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {TAGS.filter(t => !selectedTags.includes(t.id)).slice(0, 6).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleAddTag(tag.id)}
              disabled={selectedTags.length >= 5}
              className="px-2 py-1 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-colors"
            >
              #{tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'px-6 py-2.5 rounded-xl bg-white text-black font-semibold',
            'hover:bg-white/90 transition-all disabled:opacity-50',
            isPending && 'animate-pulse'
          )}
        >
          {isPending ? 'Creating...' : 'Create Discussion'}
        </button>
      </div>
    </form>
  );
}
