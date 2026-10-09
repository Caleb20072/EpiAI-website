'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { PageHeader, Panel, Badge, EmptyState } from '@/components/ui';
import { GitCommitHorizontal } from 'lucide-react';

interface StudentRow {
  userId: string;
  userName: string;
  githubUsername: string | null;
  moduleId: string;
  moduleName: string;
  level: number;
  todayCount: number;
  pushedToday: boolean;
  lastPushAt: string | null;
  lastMessage: string | null;
  activeDays: number;
}

function FollowUpPageInner() {
  const params = useParams();
  const search = useSearchParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [scope, setScope] = useState<'all' | 'lead' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleId, setModuleId] = useState(search.get('module') || '');
  const [todayOnly, setTodayOnly] = useState(false);

  useEffect(() => {
    fetch('/api/modules/progress')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) setError(data.error || 'Erreur');
        else {
          setScope(data.scope);
          setStudents(data.students || []);
        }
      })
      .catch(() => setError(fr ? 'Impossible de charger le suivi.' : 'Could not load follow-up.'))
      .finally(() => setLoading(false));
  }, [fr]);

  const modules = useMemo(() => {
    const map = new Map<string, string>();
    for (const student of students) map.set(student.moduleId, student.moduleName);
    return [...map.entries()];
  }, [students]);

  const visible = students.filter((student) => {
    if (moduleId && student.moduleId !== moduleId) return false;
    if (todayOnly && !student.pushedToday) return false;
    return true;
  });
  const pushedToday = students.filter((student) => !moduleId || student.moduleId === moduleId).filter((student) => student.pushedToday).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title={fr ? 'Suivi des étudiants' : 'Student follow-up'}
        description={
          scope === 'all'
            ? fr
              ? 'Tous les inscrits, tous les modules. Un push GitHub apparaît ici dès qu’il est reçu.'
              : 'Every enrolled student, every module. A GitHub push shows up here as soon as it is received.'
            : fr
              ? 'Les inscrits de tes modules. Ouvre un étudiant pour voir chaque push.'
              : 'Students enrolled in your modules. Open one to see every push.'
        }
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-sm text-secondary">{fr ? 'Chargement…' : 'Loading…'}</p>
      ) : students.length === 0 ? (
        <EmptyState
          icon={<GitCommitHorizontal className="w-10 h-10" />}
          title={fr ? 'Aucun étudiant inscrit pour le moment' : 'No enrolled students yet'}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {modules.length > 1 && (
              <select
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className="rounded-lg border border-default bg-card px-3 py-2 text-sm"
              >
                <option value="">{fr ? 'Tous les modules' : 'All modules'}</option>
                {modules.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={todayOnly} onChange={(event) => setTodayOnly(event.target.checked)} />
              {fr ? 'Seulement ceux qui ont poussé aujourd’hui' : 'Only those who pushed today'}
            </label>
            <Badge variant={pushedToday > 0 ? 'success' : 'muted'}>
              {pushedToday} {fr ? 'aujourd’hui' : 'today'}
            </Badge>
          </div>
          <Panel>
            <ul className="space-y-3">
              {visible.map((student) => (
                <li key={`${student.moduleId}:${student.userId}`} className="rounded-xl border border-default p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/${locale}/modules/${student.moduleId}/students/${student.userId}`}
                        className="font-medium text-brand-500 hover:underline"
                      >
                        {student.userName}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">
                        {student.moduleName}
                        {student.githubUsername ? ` · @${student.githubUsername}` : ''}
                        {' · '}
                        {student.activeDays} {fr ? 'jours actifs' : 'active days'}
                      </p>
                    </div>
                    {student.pushedToday ? (
                      <Badge variant="success">
                        {fr ? `Aujourd’hui · ${student.todayCount} push` : `Today · ${student.todayCount} push`}
                        {student.todayCount > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="muted">{fr ? 'Pas de push aujourd’hui' : 'No push today'}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-secondary mt-1">
                    {student.lastMessage
                      ? student.lastMessage
                      : fr
                        ? 'Aucun push enregistré.'
                        : 'No push recorded yet.'}
                    {student.lastPushAt ? (
                      <span className="text-muted">
                        {' · '}
                        {new Date(student.lastPushAt).toLocaleString(locale, { timeZone: 'Africa/Porto-Novo' })}
                      </span>
                    ) : null}
                  </p>
                </li>
              ))}
              {visible.length === 0 && (
                <li className="text-sm text-muted">{fr ? 'Personne dans ce filtre.' : 'Nobody in this filter.'}</li>
              )}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}

export default function FollowUpPage() {
  return (
    <Suspense fallback={<p className="text-sm text-secondary">…</p>}>
      <FollowUpPageInner />
    </Suspense>
  );
}
