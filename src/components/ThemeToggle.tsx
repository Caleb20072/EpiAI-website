'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/ThemeProvider';
import type { ThemePreference } from '@/lib/theme';

const options: { id: ThemePreference; icon: typeof Sun; label: 'light' | 'dark' | 'system' }[] = [
  { id: 'light', icon: Sun, label: 'light' },
  { id: 'system', icon: Monitor, label: 'system' },
  { id: 'dark', icon: Moon, label: 'dark' },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('Theme');
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={t('label')}
      className={`inline-flex shrink-0 items-center rounded-lg border border-default p-0.5 ${
        compact ? 'max-[380px]:scale-90 max-[380px]:origin-right' : ''
      }`}
    >
      {options.map(({ id, icon: Icon, label }) => {
        const selected = preference === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={t(label)}
            title={t(label)}
            onClick={() => setPreference(id)}
            className={`inline-flex items-center justify-center rounded-md transition-colors duration-[160ms] ${
              compact ? 'w-8 h-8' : 'w-9 h-9'
            } ${
              selected
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            <Icon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
