'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MemberSuggestion } from '@/lib/members/suggest';

interface MemberPickerProps {
  locale: string;
  selectedId: string;
  selectedName: string;
  onSelect: (member: MemberSuggestion | null) => void;
  placeholder?: string;
}

export function MemberPicker({ locale, selectedId, selectedName, onSelect, placeholder }: MemberPickerProps) {
  const fr = locale === 'fr';
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<MemberSuggestion[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const typed = query.trim();
    if (typed.length < 1 || (selectedId && typed === selectedName)) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/members/suggest?q=${encodeURIComponent(typed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setOptions([]);
          return;
        }
        const data = (await res.json()) as MemberSuggestion[];
        setOptions(data);
        setActive(0);
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setOptions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, selectedId, selectedName]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function choose(member: MemberSuggestion) {
    onSelect(member);
    setQuery(member.name);
    setOpen(false);
  }

  const showList = open && query.trim().length > 0 && !(selectedId && query === selectedName);

  useLayoutEffect(() => {
    if (!showList) return;
    function place() {
      const input = inputRef.current;
      const list = listRef.current;
      if (!input || !list) return;
      const rect = input.getBoundingClientRect();
      list.style.top = `${rect.bottom + 4}px`;
      list.style.left = `${rect.left}px`;
      list.style.width = `${rect.width}px`;
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [showList, options, query]);

  return (
    <div ref={rootRef} className="relative">
      <input
        required
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder || (fr ? 'Nom du lead' : 'Lead name')}
        ref={inputRef}
        value={query}
        autoComplete="off"
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          if (selectedId) onSelect(null);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim() && !(selectedId && query === selectedName)) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!showList && event.key !== 'Escape') return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, Math.max(options.length - 1, 0)));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === 'Enter' && options[active]) {
            event.preventDefault();
            choose(options[active]);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="w-full rounded-lg border border-default bg-card px-3 py-2 text-sm text-primary placeholder:text-muted outline-none focus:border-brand-500/50"
      />
      {showList &&
        createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          style={{ position: 'fixed', top: 0, left: 0 }}
          className="z-50 max-h-64 overflow-auto rounded-lg border border-default bg-card py-1 shadow-lg"
        >
          {loading && options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">{fr ? 'Recherche…' : 'Searching…'}</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">
              {fr ? 'Aucune personne trouvée' : 'No one found'}
            </li>
          ) : (
            options.map((member, index) => (
              <li key={member.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(member)}
                  className={`flex w-full flex-col px-3 py-2 text-left ${
                    index === active ? 'bg-brand-500/10' : ''
                  }`}
                >
                  <span className="text-sm text-primary">{member.name}</span>
                  {member.email || member.githubUsername ? (
                    <span className="text-xs text-muted">
                      {[member.email, member.githubUsername ? `@${member.githubUsername}` : ''].filter(Boolean).join(' · ')}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>,
        document.body
        )}
    </div>
  );
}
