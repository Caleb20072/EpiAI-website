'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, Panel, Button, Badge } from '@/components/ui';
import { MemberPicker } from '@/components/members/MemberPicker';

interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  level: number;
  todayCount?: number;
  lastMessage?: string | null;
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
interface Material {
  id: string;
  projectId: string | null;
  kind: 'file' | 'link' | 'video' | string;
  title: string;
  url: string | null;
  fileName: string | null;
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
  leadGithub: string | null;
  canManage: boolean;
  enrolled: boolean;
  myLevel: number;
  enrollments: Enrollment[];
  projects: Project[];
  materials: Material[];
  activities: Activity[];
  githubActivity: GithubEvent[];
}

function videoEmbed(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function MaterialList({
  items,
  fr,
  canManage,
  onDelete,
}: {
  items: Material[];
  fr: boolean;
  canManage: boolean;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const embed = item.kind === 'video' && item.url ? videoEmbed(item.url) : null;
        return (
          <li key={item.id} className="rounded-lg border border-default p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              {canManage && (
                <button type="button" className="text-xs text-red-400" onClick={() => onDelete(item.id)}>
                  {fr ? 'Retirer' : 'Remove'}
                </button>
              )}
            </div>
            {item.kind === 'file' && (
              <a href={`/api/modules/materials/${item.id}`} className="text-sm text-brand-500 underline" target="_blank" rel="noreferrer">
                {fr ? 'Ouvrir' : 'Open'} {item.fileName || 'PDF'}
              </a>
            )}
            {item.kind !== 'file' && item.url && !embed && (
              <a href={item.url} className="text-sm text-brand-500 underline break-all" target="_blank" rel="noreferrer">
                {item.url}
              </a>
            )}
            {embed && (
              <iframe
                src={embed}
                title={item.title}
                className="mt-2 aspect-video w-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </li>
        );
      })}
    </ul>
  );
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
  const [enrollId, setEnrollId] = useState('');
  const [enrollName, setEnrollName] = useState('');
  const [enrollKey, setEnrollKey] = useState(0);
  const [myGithub, setMyGithub] = useState('');
  const [project, setProject] = useState({ title: '', description: '', startsAt: '' });
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [resource, setResource] = useState({ title: '', kind: 'link', url: '' });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [activity, setActivity] = useState({ title: '', description: '', date: '', location: '' });
  const [leadGithub, setLeadGithub] = useState('');
  const [accessNote, setAccessNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/modules/${id}`);
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Erreur');
    else {
      setMod(data);
      setLeadGithub(data.leadGithub || '');
    }
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
    return { ok: res.ok, data };
  }

  async function uploadFile(file: File, title: string, projectId?: string) {
    const body = new FormData();
    body.set('file', file);
    body.set('title', title);
    if (projectId) body.set('projectId', projectId);
    const res = await fetch(`/api/modules/${id}/materials`, { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || (fr ? 'Envoi du fichier refusé' : 'File upload failed'));
      return false;
    }
    await load();
    return true;
  }

  async function removeMaterial(materialId: string) {
    setError(null);
    const res = await fetch(`/api/modules/materials/${materialId}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Erreur');
    else await load();
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
            <li key={e.id} className="flex items-start justify-between gap-2">
              <span>
                {mod.canManage ? (
                  <Link href={`/${locale}/modules/${id}/students/${e.userId}`} className="text-brand-500 hover:underline">
                    {e.userName}
                  </Link>
                ) : (
                  e.userName
                )}
                {mod.canManage && e.lastMessage ? (
                  <span className="block text-xs text-muted mt-0.5 line-clamp-1">{e.lastMessage}</span>
                ) : null}
              </span>
              <span className="text-xs text-muted text-right shrink-0">
                {mod.canManage && (e.todayCount ?? 0) > 0 ? (
                  <Badge variant="success">{fr ? `Aujourd’hui · ${e.todayCount}` : `Today · ${e.todayCount}`}</Badge>
                ) : mod.canManage ? (
                  <span>{fr ? 'Pas de push aujourd’hui' : 'No push today'}</span>
                ) : null}
                <span className="block mt-1">{fr ? 'niveau' : 'level'} {e.level}</span>
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
              if (ok.ok) setMyGithub('');
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
              if (!email) {
                setError(fr ? 'Choisis l’étudiant dans les suggestions.' : 'Pick the student from the suggestions.');
                return;
              }
              const ok = await post(`/api/modules/${id}/enroll`, {
                force: true,
                email,
                githubUsername: github,
              });
              if (ok.ok) {
                setEmail('');
                setGithub('');
                setEnrollId('');
                setEnrollName('');
                setEnrollKey((key) => key + 1);
              }
            }}
          >
            <div className="flex-1 min-w-[12rem]">
            <MemberPicker
              key={enrollKey}
              locale={locale}
              selectedId={enrollId}
              selectedName={enrollName}
              placeholder={fr ? 'Nom de l’étudiant' : 'Student name'}
              onSelect={(member) => {
                setEnrollId(member?.id || '');
                setEnrollName(member?.name || '');
                setEmail(member?.email || '');
                setGithub(member?.githubUsername || '');
              }}
            />
            </div>
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
        {mod.canManage && (
          <form
            className="mt-4 grid gap-2"
            onSubmit={async (ev) => {
              ev.preventDefault();
              const ok = await post(`/api/modules/${id}`, { leadGithub }, 'PATCH');
              if (ok.ok) {
                const repos = Number(ok.data?.repos || 0);
                const refused = Number(ok.data?.refused || 0);
                setAccessNote(
                  repos === 0
                    ? fr
                      ? 'Pseudo enregistré. L’invitation part quand un étudiant a un dépôt : crée un projet, puis inscris-le avec son pseudo GitHub.'
                      : 'Username saved. The invite goes out once a student has a repository: create a project, then enroll them with their GitHub username.'
                    : refused > 0
                      ? fr
                        ? 'Pseudo enregistré, mais GitHub a refusé l’accès à certains dépôts.'
                        : 'Username saved, but GitHub refused access to some repositories.'
                      : fr
                        ? 'Invitation envoyée. Accepte-la sur GitHub, puis ouvre le dépôt pour lire le code.'
                        : 'Invite sent. Accept it on GitHub, then open the repository to read the code.'
                );
              }
            }}
          >
            <p className="text-xs text-muted">
              {fr
                ? 'Ton pseudo GitHub. Tu reçois un accès en lecture sur le dépôt privé de chaque inscrit, pour ouvrir les fichiers et lire le code. Tu ne modifies pas leur travail.'
                : 'Your GitHub username. You get read access to each student’s private repository, so you can open the files and read the code. You do not change their work.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                required
                value={leadGithub}
                onChange={(e) => setLeadGithub(e.target.value)}
                placeholder="pseudo GitHub du lead"
                className="flex-1 rounded-lg border border-default bg-card px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm" variant="secondary">
                {fr ? 'Recevoir l’accès aux dépôts' : 'Get access to the repos'}
              </Button>
            </div>
            {accessNote && <p className="text-sm text-secondary">{accessNote}</p>}
          </form>
        )}
      </Panel>

      <Panel title={fr ? 'Ressources' : 'Resources'}>
        <p className="text-xs text-muted mb-3">
          {fr
            ? 'PDF, liens et vidéos du module. Tout membre connecté peut les ouvrir.'
            : 'PDFs, links and videos for this module. Any signed-in member can open them.'}
        </p>
        <MaterialList
          items={(mod.materials || []).filter((item) => !item.projectId)}
          fr={fr}
          canManage={mod.canManage}
          onDelete={(materialId) => void removeMaterial(materialId)}
        />
        {(mod.materials || []).filter((item) => !item.projectId).length === 0 && (
          <p className="text-sm text-muted">{fr ? 'Aucune ressource pour l’instant.' : 'No resources yet.'}</p>
        )}
        {mod.canManage && (
          <form
            className="grid gap-2 mt-4"
            onSubmit={async (ev) => {
              ev.preventDefault();
              if (resource.kind === 'file') {
                if (!resourceFile || !resource.title.trim()) {
                  setError(fr ? 'Titre et fichier requis.' : 'Title and file are required.');
                  return;
                }
                const uploaded = await uploadFile(resourceFile, resource.title.trim());
                if (uploaded) {
                  setResource({ title: '', kind: 'link', url: '' });
                  setResourceFile(null);
                }
                return;
              }
              const ok = await post(`/api/modules/${id}/materials`, resource);
              if (ok.ok) setResource({ title: '', kind: 'link', url: '' });
            }}
          >
            <input
              required
              placeholder={fr ? 'Titre' : 'Title'}
              value={resource.title}
              onChange={(e) => setResource({ ...resource, title: e.target.value })}
              className="rounded-lg border border-default bg-card px-3 py-2 text-sm"
            />
            <select
              value={resource.kind}
              onChange={(e) => setResource({ ...resource, kind: e.target.value })}
              className="rounded-lg border border-default bg-card px-3 py-2 text-sm"
            >
              <option value="link">{fr ? 'Lien' : 'Link'}</option>
              <option value="video">{fr ? 'Vidéo' : 'Video'}</option>
              <option value="file">{fr ? 'Fichier (PDF, document, image)' : 'File (PDF, document, image)'}</option>
            </select>
            {resource.kind === 'file' ? (
              <input
                required
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.zip,.txt"
                onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            ) : (
              <input
                required
                type="url"
                placeholder={resource.kind === 'video' ? 'https://youtube.com/...' : 'https://'}
                value={resource.url}
                onChange={(e) => setResource({ ...resource, url: e.target.value })}
                className="rounded-lg border border-default bg-card px-3 py-2 text-sm"
              />
            )}
            <Button type="submit" size="sm">{fr ? 'Ajouter la ressource' : 'Add resource'}</Button>
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
              <div className="mt-3">
                <MaterialList
                  items={(mod.materials || []).filter((item) => item.projectId === p.id)}
                  fr={fr}
                  canManage={mod.canManage}
                  onDelete={(materialId) => void removeMaterial(materialId)}
                />
              </div>
              {mod.canManage && (
                <form
                  className="mt-2 flex flex-wrap items-center gap-2"
                  onSubmit={async (ev) => {
                    ev.preventDefault();
                    const input = ev.currentTarget.elements.namedItem('pdf');
                    const file = input instanceof HTMLInputElement ? input.files?.[0] : null;
                    if (!file) return;
                    const uploaded = await uploadFile(file, p.title, p.id);
                    if (uploaded) ev.currentTarget.reset();
                  }}
                >
                  <input name="pdf" type="file" accept=".pdf,application/pdf" className="text-xs" />
                  <Button type="submit" size="sm" variant="secondary">
                    {fr ? 'Ajouter un PDF' : 'Add a PDF'}
                  </Button>
                </form>
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
              const title = project.title;
              const file = projectFile;
              const ok = await post(`/api/modules/${id}/projects`, project);
              if (!ok.ok) return;
              if (file && ok.data?.id) {
                await uploadFile(file, title || ok.data.title || 'PDF', ok.data.id);
              }
              setProject({ title: '', description: '', startsAt: '' });
              setProjectFile(null);
            }}
          >
            <input required placeholder={fr ? 'Titre du projet' : 'Project title'} value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" />
            <textarea placeholder={fr ? 'Description' : 'Description'} value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} className="rounded-lg border border-default bg-card px-3 py-2 text-sm" rows={3} />
            <label className="text-xs text-muted">
              {fr ? 'PDF du sujet (6 Mo max)' : 'Project PDF (6 MB max)'}
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                className="mt-1 block text-sm"
              />
            </label>
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
                  {mod.canManage ? (
                    <Link href={`/${locale}/modules/${id}/students/${event.userId}`} className="font-semibold text-brand-500 hover:underline">
                      {who}
                    </Link>
                  ) : (
                    <strong>{who}</strong>
                  )}
                  {' — '}
                  {event.message.split('\n')[0]}
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
              if (ok.ok) setActivity({ title: '', description: '', date: '', location: '' });
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
