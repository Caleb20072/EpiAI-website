'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CATEGORIES, TAGS } from '@/lib/resources/categories';
import { cn } from '@/lib/utils/cn';
import {
  FileText,
  Code,
  Play,
  BookOpen,
  GraduationCap,
  Database,
  Upload,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { getTypeLabel } from '@/lib/resources/utils';

const typeOptions = [
  { id: 'pdf', icon: FileText, label: 'PDF Document', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'code', icon: Code, label: 'Code', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'video', icon: Play, label: 'Video', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'article', icon: BookOpen, label: 'Article', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'course', icon: GraduationCap, label: 'Course', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'dataset', icon: Database, label: 'Dataset', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

const difficultyOptions = [
  { id: 'beginner', label: 'Beginner', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'intermediate', label: 'Intermediate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'advanced', label: 'Advanced', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

export function CreateResourceForm() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'article' as 'pdf' | 'code' | 'video' | 'article' | 'course' | 'dataset',
    url: '',
    categoryId: 'ia',
    tags: [] as string[],
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    author: '',
    duration: '',
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create resource');
      }

      const resource = await response.json();
      router.push(`/${locale}/resources/${resource.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleTypeSelect = (typeId: string) => {
    setFormData(prev => ({ ...prev, type: typeId as any }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
          placeholder="Enter resource title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all resize-none"
          placeholder="Describe this resource..."
          rows={4}
          required
        />
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Resource Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {typeOptions.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.type === type.id;

            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeSelect(type.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                  isSelected
                    ? type.color + ' border-current'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{getTypeLabel(type.id, locale as 'en' | 'fr')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* URL / Link */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          {formData.type === 'pdf' || formData.type === 'code' || formData.type === 'dataset'
            ? 'File URL *'
            : 'Resource URL *'}
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
          placeholder={
            formData.type === 'pdf' || formData.type === 'code' || formData.type === 'dataset'
              ? 'https://example.com/file.pdf'
              : 'https://example.com/article'
          }
          required
        />
        <p className="mt-1 text-xs text-white/40">
          {formData.type === 'pdf' || formData.type === 'code' || formData.type === 'dataset'
            ? 'Direct link to the file (Google Drive, GitHub, etc.)'
            : 'Link to the resource (article, video, course, etc.)'}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Category *
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
        >
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id} className="bg-zinc-900">
              {category.name[locale as 'en' | 'fr'] || category.name.en}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Difficulty Level
        </label>
        <div className="flex gap-3">
          {difficultyOptions.map((difficulty) => {
            const isSelected = formData.difficulty === difficulty.id;

            return (
              <button
                key={difficulty.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, difficulty: difficulty.id as any }))}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                  isSelected
                    ? difficulty.color + ' border-current'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                )}
              >
                {difficulty.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm"
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
        )}
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Author Name (optional)
        </label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
          placeholder="Author name or organization"
        />
      </div>

      {/* Duration (for videos/courses) */}
      {(formData.type === 'video' || formData.type === 'course') && (
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Duration (optional)
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            placeholder="e.g., 2h 30m, 10 hours, 45 min"
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Create Resource
            </>
          )}
        </button>
      </div>
    </form>
  );
}
