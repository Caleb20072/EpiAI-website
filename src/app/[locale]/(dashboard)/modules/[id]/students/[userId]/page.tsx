'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader, Panel, Badge } from '@/components/ui';

interface Push {
  id: string;
  message: string;
  additions: number;
  deletions: number;
  committedAt: string;
  burst: boolean;
  projectTitle: string;
  day: string;
  today: boolean;
  commitUrl: string | null;
}
interface FollowUp {
  moduleId: string;
  moduleName: string;
  student: { userName: string; githubUsername: string | null; level: number };
  repos: { projectTitle: string; repoUrl: string }[];
  submissions: { projectTitle: string; createdAt: string; notes: string }[];
  pushes: Push[];
  todayCount: number;
  activeDays: number;
}

function formatDay(day: string, locale: string) {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date)).toLocaleDateString(locale, {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function PushItems({ items, locale, fr }: { items: Push[]; locale: string; fr: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((push) => (
        <li key={push.id} className="rounded-lg border border-default p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{push.message || (fr ? 'Push sans message' : 'Push without a message')}</p>
            {push.burst ? <Badge variant="danger">burst</Badge> : null}
          </div>
          <p className="text-xs text-muted mt-1">
            {push.projectTitle ? `${push.projectTitle} · ` : ''}
            +{push.additions}/-{push.deletions}
            {' · '}
            {new Date(push.committedAt).toLocaleTimeString(locale, {
              timeZone: 'Africa/Porto-Novo',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {push.commitUrl && (
            <a href={push.commitUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-500 underline">
              {fr ? 'Voir le commit' : 'Open the commit'}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function StudentFollowUpPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const moduleId = params.id as string;
  const studentId = params.userId as string;
  const [data, setData] = useState<FollowUp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}/students/${studentId}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) setError(body.error || 'Erreur');
        else setData(body);
      })
      .catch(() => setError(fr ? 'Impossible de charger cet étudiant.' : 'Could not load this student.'));
  }, [moduleId, studentId, fr]);

  if (!data && !error) return <p className="text-sm text-secondary">…</p>;
  if (!data) return <p className="text-sm text-red-400">{error}</p>;

  const groups: { day: string; items: Push[] }[] = [];
  for (const push of data.pushes) {
    const last = groups[groups.length - 1];
    if (!last || last.day !== push.day) groups.push({ day: push.day, items: [push] });
    else last.items.push(push);
  }
  const today = data.pushes.filter((push) => push.today);

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        eyebrow={data.moduleName}
        title={data.student.userName}
        description={
          fr
            ? `${data.student.githubUsername ? `@${data.student.githubUsername} · ` : ''}${data.activeDays} jours de travail régulier · niveau ${data.student.level}`
            : `${data.student.githubUsername ? `@${data.student.githubUsername} · ` : ''}${data.activeDays} steady work days · level ${data.student.level}`
        }
        actions={
          <Link href={`/${locale}/suivi?module=${data.moduleId}`} className="text-sm text-brand-500 hover:underline">
            {fr ? 'Retour au suivi' : 'Back to follow-up'}
          </Link>
        }
      />
      {error && <p className="text-sm text-red-400">{error}</p>}

      <Panel title={fr ? 'Aujourd’hui' : 'Today'}>
        {today.length === 0 ? (
          <p className="text-sm text-muted">{fr ? 'Aucun push aujourd’hui.' : 'No push today.'}</p>
        ) : (
          <PushItems items={today} locale={locale} fr={fr} />
        )}
      </Panel>

      <Panel title={fr ? 'Évolution' : 'Progress'}>
        {groups.length === 0 ? (
          <p className="text-sm text-muted">
            {fr
              ? 'Aucun push enregistré. Chaque envoi sur le dépôt du module apparaît ici.'
              : 'No push recorded yet. Each push to the module repository shows up here.'}
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.day}>
                <h3 className="text-sm font-semibold mb-2 capitalize">{formatDay(group.day, locale)}</h3>
                <PushItems items={group.items} locale={locale} fr={fr} />
              </section>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={fr ? 'Dépôts' : 'Repositories'}>
        {data.repos.length === 0 ? (
          <p className="text-sm text-muted">
            {fr ? 'Pas encore de dépôt pour cet étudiant.' : 'No repository for this student yet.'}
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {data.repos.map((repo) => (
              <li key={repo.repoUrl}>
                <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
                  {repo.projectTitle} — {fr ? 'lire le code' : 'read the code'}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {data.submissions.length > 0 && (
        <Panel title={fr ? 'Rendus' : 'Submissions'}>
          <ul className="space-y-2 text-sm">
            {data.submissions.map((submission) => (
              <li key={`${submission.projectTitle}-${submission.createdAt}`}>
                <span className="font-medium">{submission.projectTitle}</span>
                <span className="text-muted">
                  {' · '}
                  {new Date(submission.createdAt).toLocaleString(locale, { timeZone: 'Africa/Porto-Novo' })}
                </span>
                {submission.notes ? <p className="text-secondary">{submission.notes}</p> : null}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
