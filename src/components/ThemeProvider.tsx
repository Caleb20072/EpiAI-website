'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_STORAGE_KEY, isThemePreference, type ThemePreference } from '@/lib/theme';

export type { ThemePreference };

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(value)) return value;
  } catch {
    /* private mode */
  }
  return 'system';
}

function systemIsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyThemeClass(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'system' && systemIsDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    const stored = readPreference();
    setPreferenceState(stored);
    applyThemeClass(stored);
  }, []);

  useEffect(() => {
    if (preference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next = isThemePreference(event.newValue) ? event.newValue : 'system';
      setPreferenceState(next);
      applyThemeClass(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
    applyThemeClass(next);
  }, []);

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
