'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Search, X } from 'lucide-react';

interface SearchResults {
  resources: { id: string; title: string; type: string }[];
  events: { id: string; title: string; date: string }[];
  threads: { id: string; title: string; categoryId: string }[];
  projects: { id: string; titleEn: string; titleFr: string }[];
  members: { id: string; name: string; role: string }[];
}

export default function GlobalSearch() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results &&
    (results.resources.length +
      results.events.length +
      results.threads.length +
      results.projects.length +
      results.members.length >
      0);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-sm"
        aria-label={locale === 'fr' ? 'Rechercher' : 'Search'}
        aria-expanded={open}
      >
        <Search className="w-4 h-4" aria-hidden />
        <span className="hidden sm:inline">{locale === 'fr' ? 'Rechercher…' : 'Search…'}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'fr' ? 'Recherche globale' : 'Global search'}
        >
          <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-white/10">
              <Search className="w-5 h-5 text-white/40" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  locale === 'fr'
                    ? 'Ressources, événements, forum, membres…'
                    : 'Resources, events, forum, members…'
                }
                aria-label={locale === 'fr' ? 'Terme de recherche' : 'Search term'}
                className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white p-1"
                aria-label={locale === 'fr' ? 'Fermer' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <p className="text-white/40 text-sm text-center py-4" aria-live="polite">
                  …
                </p>
              )}
              {!loading && query && !hasResults && (
                <p className="text-white/40 text-sm text-center py-4">
                  {locale === 'fr' ? 'Aucun résultat' : 'No results'}
                </p>
              )}
              {results?.members.map((m) => (
                <div key={m.id} className="p-3 rounded-xl text-sm text-white/80">
                  <span className="text-white/40 text-xs">Membre · </span>
                  {m.name}
                  <span className="text-white/30 text-xs ml-2">({m.role})</span>
                </div>
              ))}
              {results?.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-xl hover:bg-white/5 text-sm"
                >
                  <span className="text-white/40 text-xs">Projet · </span>
                  <span className="text-white">
                    {locale === 'fr' ? p.titleFr : p.titleEn}
                  </span>
                </Link>
              ))}
              {results?.threads.map((t) => (
                <Link
                  key={t.id}
                  href={`/forum/${t.id}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-xl hover:bg-white/5 text-sm"
                >
                  <span className="text-white/40 text-xs">Forum · </span>
                  <span className="text-white">{t.title}</span>
                </Link>
              ))}
              {results?.events.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.id}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-xl hover:bg-white/5 text-sm"
                >
                  <span className="text-white/40 text-xs">Event · </span>
                  <span className="text-white">{e.title}</span>
                </Link>
              ))}
              {results?.resources.map((r) => (
                <Link
                  key={r.id}
                  href={`/resources/${r.id}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-xl hover:bg-white/5 text-sm"
                >
                  <span className="text-white/40 text-xs">Resource · </span>
                  <span className="text-white">{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
