const API = 'https://api.github.com';

function headers() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN manquant');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

export function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_ORG);
}

export async function createOrgRepo(name: string, description: string) {
  const org = process.env.GITHUB_ORG;
  const res = await fetch(`${API}/orgs/${org}/repos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, description, private: true, auto_init: true }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 422 && String(body?.message || '').includes('already exists')) {
    return { html_url: `https://github.com/${org}/${name}`, name, existed: true };
  }
  if (!res.ok) throw new Error(body?.message || `Création du dépôt ${name} refusée`);
  return { html_url: body.html_url as string, name, existed: false };
}

export async function addCollaborator(
  repoName: string,
  githubUsername: string,
  permission: 'pull' | 'push' = 'push'
) {
  const org = process.env.GITHUB_ORG;
  const res = await fetch(`${API}/repos/${org}/${repoName}/collaborators/${githubUsername}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ permission }),
  });
  if (!res.ok && res.status !== 201 && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Impossible d'ajouter ${githubUsername} au dépôt`);
  }
}

function siteOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/(fr|en)\/?$/, '').replace(/\/$/, '');
  }
}

function webhookUrl() {
  const site = siteOrigin();
  return site ? `${site}/api/webhooks/github` : '';
}

async function ensureHook(listUrl: string, createUrl: string) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const url = webhookUrl();
  if (!secret || !url) return;
  const list = await fetch(listUrl, { headers: headers() });
  const hooks = list.ok ? await list.json() : [];
  if (Array.isArray(hooks) && hooks.some((h: { config?: { url?: string } }) => h.config?.url === url)) {
    return;
  }
  await fetch(createUrl, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: 'web',
      active: true,
      events: ['push'],
      config: { url, content_type: 'json', secret, insecure_ssl: '0' },
    }),
  });
}

export async function ensureRepoPushWebhook(repoName: string) {
  const org = process.env.GITHUB_ORG;
  if (!org || !repoName) return;
  await ensureHook(
    `${API}/repos/${org}/${repoName}/hooks`,
    `${API}/repos/${org}/${repoName}/hooks`
  );
}

export async function ensureOrgPushWebhook() {
  const org = process.env.GITHUB_ORG;
  if (!org) return;
  await ensureHook(`${API}/orgs/${org}/hooks`, `${API}/orgs/${org}/hooks`);
}

export async function getCommitStats(repoName: string, sha: string) {
  const org = process.env.GITHUB_ORG;
  if (!org || !process.env.GITHUB_TOKEN) return null;
  const res = await fetch(`${API}/repos/${org}/${repoName}/commits/${sha}`, { headers: headers() });
  if (!res.ok) return null;
  const body = await res.json();
  return {
    additions: Number(body?.stats?.additions || 0),
    deletions: Number(body?.stats?.deletions || 0),
    message: String(body?.commit?.message || ''),
  };
}

export async function listRepoCommits(repoName: string) {
  const org = process.env.GITHUB_ORG;
  const res = await fetch(`${API}/repos/${org}/${repoName}/commits?per_page=50`, {
    headers: headers(),
  });
  if (!res.ok) return [];
  const commits = await res.json();
  if (!Array.isArray(commits)) return [];
  return commits.map((c: {
    sha: string;
    commit: { message: string; author?: { date?: string } };
    stats?: { additions?: number; deletions?: number };
  }) => ({
    sha: c.sha,
    message: c.commit?.message || '',
    committedAt: c.commit?.author?.date || new Date().toISOString(),
    additions: c.stats?.additions || 0,
    deletions: c.stats?.deletions || 0,
  }));
}
