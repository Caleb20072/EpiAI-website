'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className,
  placeholder = 'Search discussions...',
}: SearchBarProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string || 'en';

  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        newParams.set('search', query.trim());
      } else {
        newParams.delete('search');
      }
      router.push(`/${locale}/forum?${newParams.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery('');
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('search');
      router.push(`/${locale}/forum?${newParams.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
          isPending ? 'text-muted' : 'text-muted'
        )}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-10 py-2.5 rounded-xl bg-card border border-default',
          'text-primary placeholder:text-muted',
          'focus:outline-none focus:border-brand-500/40 focus:bg-card-muted',
          'transition-all'
        )}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </form>
  );
}
