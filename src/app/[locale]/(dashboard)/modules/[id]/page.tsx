'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, Panel, Button, Badge } from '@/components/ui';

interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  level: number;
}
interface Repo {
  userId: string;
  repoUrl: string;
}
interface Submission {
  userId: string;
  points: number;
}
interface Project {
  id: string;
  title: string;
  description: string;
  pdfUrl: string | null;
  startsAt: string;
  submissions: Submission[];
  repos: Repo[];
}
interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
}
interface GithubEvent {
  id: string;
  userId: string;
  message: string;
  additions: number;
  deletions: number;
  committedAt: string;
  burst: boolean;
  projectId: string;
}
interface ModuleDetail {
  id: string;
  name: string;
  description: string;
  leadName: string;
  canManage: boolean;
  enrolled: boolean;
  myLevel: number;
  enrollments: Enrollment[];
  projects: Project[];
  activities: Activity[];
  githubActivity: GithubEvent[];
}

export default function ModuleDetailPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const fr = locale === 'fr';
  const id = params.id as string;
  const [mod, setMod] = useState<ModuleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [myGithub, setMyGithub] = useState('');
  const [project, setProject] = useState({ title: '', description: '', pdfUrl: '', startsAt: '' });
  const [activity, setActivity] = useState({ title: '', description: '', date: '', location: '' });

  async function load() {
    const res = await fetch(`/api/modules/${id}`);
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Erreur');
    else setMod(data);
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function post(url: string, body: unknown, method = 'POST') {
    setError(null);
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Erreur');
    else await load();
    return res.ok;
  }

  if (!mod && !error) return <p className="text-sm text-secondary">…</p>;
  if (!mod) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        eyebrow={mod.leadName}
        title={mod.name}
        description={mod.description}
        actions={
          <Badge variant="brand">
            {fr ? 'Niveau' : 'Level'} {mod.myLevel}
          </Badge>
        }
      />
      {error && <p className="text-sm text-red-400">{error}</p>}

      <Panel title={fr ? 'Inscrits' : 'Enrolled'}>
        <ul className="space-y-1 text-sm">
          {mod.enrollments.map((e) => (
            <li key={e.id} className="flex justify-between gap-2">
              <span>{e.userName}</span>
              <span className="text-muted">
                {fr ? 'niveau' : 'level'} {e.level}
              </span>
            </li>
          ))}
          {mod.enrollments.length === 0 && (
            <li className="text-muted">{fr ? 'Personne pour l’instant' : 'Nobody yet'}</li>
          )}
        </ul>
        {!mod.enrolled && !mod.canManage && (
          <form
            className="flex flex-col sm:flex-row gap-2 mt-4"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const ok = await post(`/api/modules/${id}/enroll`, { githubUsername: myGithub });
              if (ok) setMyGithub('');
            }}
          >
            <input
              required
              value={myGithub}
              onChange={(e) => setMyGithub(e.target.value)}
              placeholder={fr ? 'Ton pseudo GitHub' : 'Your GitHub username'}
              className="flex-1 rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm">
              {fr ? "S'inscrire" : 'Enroll'}
            </Button>
          </form>
        )}
        {mod.canManage && (
          <form
            className="flex flex-col sm:flex-row gap-2 mt-4"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const ok = await post(`/api/modules/${id}/enroll`, {
                force: true,
                email,
                githubUsername: github,
              });
              if (ok) {
                setEmail('');
                setGithub('');
              }
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@etudiant"
              className="flex-1 rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="pseudo GitHub"
              className="flex-1 rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm" variant="secondary">
              {fr ? 'Inscrire de force' : 'Force enroll'}
            </Button>
          </form>
        )}
      </Panel>

      <Panel title={fr ? 'Projets' : 'Projects'}>
        <div className="space-y-4">
          {mod.projects.map((p) => (
            <div key={p.id} className="rounded-xl border border-default p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{p.title}</h3>
                <span className="text-xs text-muted">
                  {new Date(p.startsAt).toLocaleDateString(locale)}
                </span>
              </div>
              <p className="text-sm text-secondary mt-1 whitespace-pre-wrap">{p.description}</p>
              {p.pdfUrl && (
                <a href={p.pdfUrl} className="text-sm text-brand-500 underline" target="_blank" rel="noreferrer">
                  PDF
                </a>
              )}
              <p className="text-xs text-muted mt-2">
                {p.submissions.length} {fr ? 'rendus' : 'submissions'} · {p.repos.length} repos
              </p>
              {p.repos.map((r) => (
                <a key={r.userId} href={r.repoUrl} className="block text-xs text-brand-500 truncate" target="_blank" rel="noreferrer">
                  {r.repoUrl}
                </a>
              ))}
              {mod.canManage && (
                <Button
                  className="mt-2"
                  size="sm"
                  variant="secondary"
                  onClick={() => void post(`/api/modules/projects/${p.id}/submit`, {}, 'PUT')}
                >
                  {fr ? 'Créer les dépôts GitHub' : 'Create GitHub repos'}
                </Button>
              )}
            </div>
          ))}
        </div>

        {mod.canManage && (
          <form
            className="grid gap-2 mt-4"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const ok = await post(`/api/modules/${id}/projects`, project);
              if (ok) setProject({ title: '', description: '', pdfUrl: '', startsAt: '' });
            }}
          >
            <input required placeholder={fr ? 'Titre du projet' : 'Project title'} value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <textarea placeholder={fr ? 'Description' : 'Description'} value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" rows={3} />
            <input placeholder="URL du PDF" value={project.pdfUrl} onChange={(e) => setProject({ ...project, pdfUrl: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <input required type="datetime-local" value={project.startsAt} onChange={(e) => setProject({ ...project, startsAt: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <Button type="submit" size="sm">{fr ? 'Ajouter le projet' : 'Add project'}</Button>
          </form>
        )}
      </Panel>

      <Panel title={fr ? 'Suivi GitHub' : 'GitHub activity'}>
        <p className="text-xs text-muted mb-3">
          {fr
            ? 'Le niveau vient des jours où tu pushes vraiment. Un gros envoi d’un coup est marqué « burst » et ne compte pas comme du travail régulier.'
            : 'Level comes from days you actually push. A single huge dump is flagged as a burst and does not count as steady work.'}
        </p>
        <ul className="space-y-2 text-sm">
          {mod.githubActivity.map((event) => {
            const who = mod.enrollments.find((e) => e.userId === event.userId)?.userName || event.userId;
            return (
              <li key={event.id} className="flex justify-between gap-3">
                <span>
                  <strong>{who}</strong> — {event.message.split('\n')[0]}
                  {event.burst ? (
                    <Badge variant="danger" className="ml-2">burst</Badge>
                  ) : null}
                </span>
                <span className="text-xs text-muted shrink-0">
                  +{event.additions}/-{event.deletions} · {new Date(event.committedAt).toLocaleString(locale)}
                </span>
              </li>
            );
          })}
          {mod.githubActivity.length === 0 && (
            <li className="text-muted">{fr ? 'Aucun push pour l’instant.' : 'No pushes yet.'}</li>
          )}
        </ul>
      </Panel>

      <Panel title={fr ? 'Activités du module (visibles par tous sur l’intra)' : 'Module activities (visible to everyone on the intranet)'}>
        <ul className="text-sm space-y-1 mb-3">
          {mod.activities.map((a) => (
            <li key={a.id} className="flex justify-between gap-2">
              <Link href={`/${locale}/intranet/${a.id}`} className="text-brand-500 hover:underline">{a.title}</Link>
              <span className="text-muted">{new Date(a.date).toLocaleString(locale)}</span>
            </li>
          ))}
        </ul>
        {mod.canManage && (
          <form
            className="grid gap-2"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const ok = await post(`/api/modules/${id}/projects`, activity, 'PUT');
              if (ok) setActivity({ title: '', description: '', date: '', location: '' });
            }}
          >
            <input required placeholder={fr ? 'Titre activité' : 'Activity title'} value={activity.title} onChange={(e) => setActivity({ ...activity, title: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <input required type="datetime-local" value={activity.date} onChange={(e) => setActivity({ ...activity, date: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <input required placeholder={fr ? 'Lieu' : 'Location'} value={activity.location} onChange={(e) => setActivity({ ...activity, location: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <textarea placeholder={fr ? 'Description' : 'Description'} value={activity.description} onChange={(e) => setActivity({ ...activity, description: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" rows={2} />
            <Button type="submit" size="sm">{fr ? 'Publier sur le calendrier intra' : 'Publish on intranet calendar'}</Button>
          </form>
        )}
      </Panel>
    </div>
  );
}
