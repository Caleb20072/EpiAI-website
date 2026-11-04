'use client';

import { CATEGORIES } from '@/lib/events/categories';
import { cn } from '@/lib/utils/cn';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  FlaskConical,
  GraduationCap,
  Hammer,
  Mic2,
  Sparkles,
  Calendar,
} from 'lucide-react';

const iconComponents: Record<string, typeof Calendar> = {
  Sparkles,
  Mic2,
  FlaskConical,
  Hammer,
  GraduationCap,
};

interface CategoryFilterProps {
  className?: string;
}

export function CategoryFilter({ className }: CategoryFilterProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'en';
  const fr = locale === 'fr';

  const selectedCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryId);
    }
    router.push(`/${locale}/events?${newParams.toString()}`);
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        type="button"
        onClick={() => handleCategoryChange('all')}
        className={cn(
          'rounded-xl border px-4 py-2 text-sm font-medium transition-all',
          selectedCategory === 'all'
            ? 'border-white/40 bg-white/20 text-primary'
            : 'border-default bg-card text-secondary hover:bg-card-muted hover:text-primary',
        )}
      >
        {fr ? 'Toutes les séries' : 'All series'}
      </button>

      {CATEGORIES.map((category) => {
        const Icon = iconComponents[category.icon] || Calendar;
        const isSelected = selectedCategory === category.id;

        return (
          <button
            type="button"
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all',
              isSelected
                ? 'border-white/40 bg-white/20 text-primary'
                : 'border-default bg-card text-secondary hover:bg-card-muted hover:text-primary',
            )}
          >
            <Icon className={cn('h-4 w-4', category.color)} />
            <span>{category.name[locale as 'en' | 'fr'] || category.name.en}</span>
          </button>
        );
      })}
    </div>
  );
}
