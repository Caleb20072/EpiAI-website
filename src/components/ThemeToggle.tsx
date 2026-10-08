'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const t = useTranslations('Theme');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('epiai-theme') === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('epiai-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-secondary hover:text-primary hover:bg-card-muted active:scale-[0.98] transition-[color,background-color,transform] duration-[160ms]"
      aria-label={dark ? t('to_light') : t('to_dark')}
    >
      {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}
