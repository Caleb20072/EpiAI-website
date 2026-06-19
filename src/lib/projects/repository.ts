import { prisma } from '@/lib/prisma';

export interface ProjectApiShape {
  _id: string;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  content?: { en?: string; fr?: string };
  imageUrl?: string | null;
  status?: string | null;
  techStack: string[];
  githubUrl?: string | null;
  discoveryUrl?: string | null;
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

function toApi(project: {
  id: string;
  titleEn: string;
  titleFr: string;
  descEn: string;
  descFr: string;
  contentEn: string | null;
  contentFr: string | null;
  imageUrl: string | null;
  status: string | null;
  techStack: string[];
  githubUrl: string | null;
  discoveryUrl: string | null;
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): ProjectApiShape {
  return {
    _id: project.id,
    title: { en: project.titleEn, fr: project.titleFr },
    description: { en: project.descEn, fr: project.descFr },
    content: { en: project.contentEn ?? undefined, fr: project.contentFr ?? undefined },
    imageUrl: project.imageUrl,
    status: project.status,
    techStack: project.techStack,
    githubUrl: project.githubUrl,
    discoveryUrl: project.discoveryUrl,
    published: project.published,
    createdBy: project.createdBy,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function parseBilingualField(
  value: string | { en?: string; fr?: string } | undefined,
  fallback = ''
): { en: string; fr: string } {
  if (!value) return { en: fallback, fr: fallback };
  if (typeof value === 'string') return { en: value, fr: value };
  return { en: value.en || fallback, fr: value.fr || value.en || fallback };
}

export async function getProjects(publishedOnly = true) {
  const projects = await prisma.project.findMany({
    where: publishedOnly ? { published: true } : {},
    orderBy: { createdAt: 'desc' },
  });
  return projects.map(toApi);
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  return project ? toApi(project) : null;
}

export async function createProject(data: {
  title: string | { en?: string; fr?: string };
  description: string | { en?: string; fr?: string };
  content?: string | { en?: string; fr?: string };
  imageUrl?: string;
  status?: string;
  techStack?: string[];
  githubUrl?: string;
  discoveryUrl?: string;
  published?: boolean;
  createdBy: string;
}) {
  const title = parseBilingualField(data.title);
  const description = parseBilingualField(data.description);
  const content = data.content ? parseBilingualField(data.content) : { en: '', fr: '' };

  const project = await prisma.project.create({
    data: {
      titleEn: title.en,
      titleFr: title.fr,
      descEn: description.en,
      descFr: description.fr,
      contentEn: content.en || null,
      contentFr: content.fr || null,
      imageUrl: data.imageUrl,
      status: data.status,
      techStack: data.techStack || [],
      githubUrl: data.githubUrl,
      discoveryUrl: data.discoveryUrl,
      published: data.published ?? false,
      createdBy: data.createdBy,
    },
  });
  return toApi(project);
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string | { en?: string; fr?: string };
    description: string | { en?: string; fr?: string };
    content: string | { en?: string; fr?: string };
    imageUrl: string;
    status: string;
    techStack: string[];
    githubUrl: string;
    discoveryUrl: string;
    published: boolean;
  }>
) {
  const update: Record<string, unknown> = {};
  if (data.title) {
    const t = parseBilingualField(data.title);
    update.titleEn = t.en;
    update.titleFr = t.fr;
  }
  if (data.description) {
    const d = parseBilingualField(data.description);
    update.descEn = d.en;
    update.descFr = d.fr;
  }
  if (data.content) {
    const c = parseBilingualField(data.content);
    update.contentEn = c.en;
    update.contentFr = c.fr;
  }
  if (data.imageUrl !== undefined) update.imageUrl = data.imageUrl;
  if (data.status !== undefined) update.status = data.status;
  if (data.techStack !== undefined) update.techStack = data.techStack;
  if (data.githubUrl !== undefined) update.githubUrl = data.githubUrl;
  if (data.discoveryUrl !== undefined) update.discoveryUrl = data.discoveryUrl;
  if (data.published !== undefined) update.published = data.published;

  try {
    const project = await prisma.project.update({ where: { id }, data: update });
    return toApi(project);
  } catch {
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
