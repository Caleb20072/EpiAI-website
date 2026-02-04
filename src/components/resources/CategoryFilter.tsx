'use client';

import { CATEGORIES } from '@/lib/resources/categories';
import { cn } from '@/lib/utils/cn';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Brain,
  TrendingUp,
  Network,
  Globe,
  Smartphone,
  Database,
  FolderOpen,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  Brain,
  TrendingUp,
  Network,
  Globe,
  Smartphone,
  Database,
  FolderOpen,
};

interface CategoryFilterProps {
  className?: string;
}

export function CategoryFilter({ className }: CategoryFilterProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string || 'en';

  const selectedCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    router.push(`/${locale}/resources?${newParams.toString()}`);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => handleCategoryChange('all')}
        className={cn(
          'px-4 py-2 rounded-xl text-sm font-medium transition-all',
          selectedCategory === 'all'
            ? 'bg-white/20 text-white border border-white/40'
            : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
        )}
      >
        All
      </button>

      {CATEGORIES.map((category) => {
        const Icon = iconComponents[category.icon] || FolderOpen;
        const isSelected = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
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
  );
}
