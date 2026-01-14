'use client';

import { getDifficultyInfo } from '@/lib/resources/utils';
import { cn } from '@/lib/utils/cn';

interface DifficultyBadgeProps {
  difficulty: string;
  locale: 'en' | 'fr';
  className?: string;
}

export function DifficultyBadge({ difficulty, locale, className }: DifficultyBadgeProps) {
  const info = getDifficultyInfo(difficulty, locale);

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border',
      info.color,
      className
    )}>
      {info.label}
    </span>
  );
}
