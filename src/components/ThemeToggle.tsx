'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('epiai-theme');
    const prefersDark = stored ? stored === 'dark' : true;
    setDark(prefersDark);
    document.documentElement.classList.toggle('light', !prefersDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('epiai-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'p-2 rounded-xl border border-default bg-card text-secondary',
        'hover:text-primary hover:bg-card-muted transition-colors'
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
