import { prisma } from '@/lib/prisma';
import { CONTRACT_VERSION, LATE_FEE_FCFA, MONTHLY_FEE_FCFA } from './contract';
import { addCollaborator, createOrgRepo, ensureOrgPushWebhook, getCommitStats, githubConfigured } from './github';

function periodKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function dueDateFor(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 5, 23, 59, 59);
}

export async function listModulesForUser(userId: string) {
  const modules = await prisma.learningModule.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { enrollments: true, projects: true } },
      enrollments: { where: { userId }, select: { level: true } },
    },
  });

  return modules.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      leadUserId: m.leadUserId,
      leadName: m.leadName,
      isLead: m.leadUserId === userId,
      enrolled: m.enrollments.length > 0,
      level: m.enrollments[0]?.level ?? 0,
      enrollmentCount: m._count.enrollments,
      projectCount: m._count.projects,
    }));
}

export async function getModuleDetail(id: string) {
  return prisma.learningModule.findUnique({
    where: { id },
    include: {
      enrollments: { orderBy: { userName: 'asc' } },
      projects: {
        orderBy: { startsAt: 'asc' },
        include: { submissions: true, repos: true },
      },
      activities: { orderBy: { date: 'asc' }, take: 30 },
    },
  });
}

export function canManageModule(
  module: { leadUserId: string },
  userId: string,
  isAdmin: boolean
) {
  return isAdmin || module.leadUserId === userId;
}

export async function createModule(input: {
  name: string;
  description: string;
  leadUserId: string;
  leadName: string;
  createdBy: string;
}) {
  return prisma.learningModule.create({ data: input });
}

export async function enrollStudent(input: {
  moduleId: string;
  userId: string;
  userName: string;
  userEmail: string;
  githubUsername?: string;
  forced?: boolean;
}) {
  const githubUsername = input.githubUsername?.replace(/^@/, '').trim() || null;
  const enrollment = await prisma.moduleEnrollment.upsert({
    where: { moduleId_userId: { moduleId: input.moduleId, userId: input.userId } },
    create: {
      moduleId: input.moduleId,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      githubUsername,
      forced: Boolean(input.forced),
    },
    update: {
      userName: input.userName,
      userEmail: input.userEmail,
      ...(githubUsername ? { githubUsername } : {}),
      forced: Boolean(input.forced),
    },
  });

  const repos = await provisionReposForStudent(input.moduleId, input.userId);
  return { enrollment, repos };
}

export async function enrollByEmail(moduleId: string, email: string, githubUsername?: string) {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  if (!user) {
    throw new Error("Aucun compte avec cet email. La personne doit d'abord se connecter une fois.");
  }
  const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
  return enrollStudent({
    moduleId,
    userId: user.clerkId,
    userName: name,
    userEmail: user.email,
    githubUsername,
    forced: true,
  });
}

export async function createModuleProject(input: {
  moduleId: string;
  title: string;
  description: string;
  pdfUrl?: string;
  startsAt: string;
  createdBy: string;
}) {
  return prisma.moduleProject.create({
    data: {
      moduleId: input.moduleId,
      title: input.title,
      description: input.description,
      pdfUrl: input.pdfUrl || null,
      startsAt: new Date(input.startsAt),
      createdBy: input.createdBy,
    },
  });
}

export async function submitProject(input: {
  projectId: string;
  userId: string;
  notes: string;
  fileUrl?: string;
}) {
  const project = await prisma.moduleProject.findUnique({
    where: { id: input.projectId },
    include: { module: true },
  });
  if (!project) throw new Error('Projet introuvable');

  const enrollment = await prisma.moduleEnrollment.findUnique({
    where: { moduleId_userId: { moduleId: project.moduleId, userId: input.userId } },
  });
  if (!enrollment && project.module.leadUserId !== input.userId) {
    throw new Error('Tu dois être inscrit à ce module');
  }

  const existing = await prisma.moduleSubmission.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: input.userId } },
  });
  if (existing) throw new Error('Déjà rendu');

  await prisma.moduleSubmission.create({
    data: {
      projectId: input.projectId,
      userId: input.userId,
      notes: input.notes,
      fileUrl: input.fileUrl || null,
      points: 0,
    },
  });

  return { points: 0, trackedViaGithub: true };
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}

export async function provisionReposForStudent(moduleId: string, userId: string) {
  if (!githubConfigured()) {
    return { created: [] as { repoUrl: string }[], warning: 'GITHUB_TOKEN et GITHUB_ORG ne sont pas configurés' };
  }

  const module = await prisma.learningModule.findUnique({
    where: { id: moduleId },
    include: { projects: true, enrollments: { where: { userId } } },
  });
  const enrollment = module?.enrollments[0];
  if (!module || !enrollment) return { created: [], warning: 'Inscription introuvable' };

  await ensureOrgPushWebhook().catch(() => undefined);

  const created: { repoUrl: string; projectId: string }[] = [];
  for (const project of module.projects) {
    const existing = await prisma.moduleProjectRepo.findUnique({
      where: { projectId_userId: { projectId: project.id, userId } },
    });
    if (existing) continue;

    const repoName = `${slugify(module.name)}-${slugify(project.title)}-${userId.slice(-6)}`.slice(0, 80);
    const repo = await createOrgRepo(repoName, `${module.name} — ${project.title} — ${enrollment.userName}`);
    if (enrollment.githubUsername) {
      await addCollaborator(repo.name, enrollment.githubUsername);
    }
    await prisma.moduleProjectRepo.create({
      data: { projectId: project.id, userId, repoName: repo.name, repoUrl: repo.html_url },
    });
    created.push({ repoUrl: repo.html_url, projectId: project.id });
  }

  return { created, warning: enrollment.githubUsername ? null : 'Pseudo GitHub manquant : dépôt créé, accès collaborateur non ajouté' };
}

export async function provisionGithubRepos(projectId: string) {
  const project = await prisma.moduleProject.findUnique({
    where: { id: projectId },
    include: { module: { include: { enrollments: true } } },
  });
  if (!project) throw new Error('Projet introuvable');
  const all = [];
  for (const enrollment of project.module.enrollments) {
    all.push(await provisionReposForStudent(project.moduleId, enrollment.userId));
  }
  return all.flatMap((r) => r.created);
}

const BURST_WINDOW_MS = 20 * 60 * 1000;
const BURST_COMMIT_COUNT = 6;

export async function recordGithubCommit(input: {
  repoName: string;
  sha: string;
  message: string;
  additions: number;
  deletions: number;
  committedAt: string;
}) {
  const repo = await prisma.moduleProjectRepo.findFirst({ where: { repoName: input.repoName } });
  if (!repo) return null;

  const stats = await getCommitStats(input.repoName, input.sha).catch(() => null);
  const additions = stats?.additions ?? input.additions;
  const deletions = stats?.deletions ?? input.deletions;
  const committedAt = new Date(input.committedAt);
  const recent = await prisma.githubActivity.count({
    where: {
      userId: repo.userId,
      projectId: repo.projectId,
      committedAt: { gte: new Date(committedAt.getTime() - BURST_WINDOW_MS) },
    },
  });
  const hugeDump = additions + deletions > 800 && recent === 0;
  const burst = recent + 1 >= BURST_COMMIT_COUNT || hugeDump;

  const activity = await prisma.githubActivity.upsert({
    where: { sha: input.sha },
    create: {
      repoId: repo.id,
      userId: repo.userId,
      projectId: repo.projectId,
      sha: input.sha,
      message: (stats?.message || input.message).slice(0, 500),
      additions,
      deletions,
      committedAt,
      burst,
    },
    update: {},
  });

  await refreshEnrollmentLevel(repo.userId, repo.projectId);
  return activity;
}

async function refreshEnrollmentLevel(userId: string, projectId: string) {
  const project = await prisma.moduleProject.findUnique({ where: { id: projectId } });
  if (!project) return;
  const projectIds = await prisma.moduleProject.findMany({
    where: { moduleId: project.moduleId },
    select: { id: true },
  });
  const events = await prisma.githubActivity.findMany({
    where: { userId, projectId: { in: projectIds.map((p) => p.id) } },
  });
  const days = new Set(
    events.filter((e) => !e.burst).map((e) => e.committedAt.toISOString().slice(0, 10))
  );
  await prisma.moduleEnrollment.updateMany({
    where: { moduleId: project.moduleId, userId },
    data: { level: days.size * 5 },
  });
}

export async function listGithubActivity(moduleId: string) {
  const projects = await prisma.moduleProject.findMany({
    where: { moduleId },
    select: { id: true },
  });
  return prisma.githubActivity.findMany({
    where: { projectId: { in: projects.map((p) => p.id) } },
    orderBy: { committedAt: 'desc' },
    take: 80,
  });
}

export async function ensureCurrentDue(user: { clerkId: string; email: string; firstName: string; lastName: string }) {
  const period = periodKey();
  const dueDate = dueDateFor();
  const name = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const due = await prisma.membershipDue.upsert({
    where: { userId_period: { userId: user.clerkId, period } },
    create: {
      userId: user.clerkId,
      userName: name,
      userEmail: user.email,
      period,
      baseAmount: MONTHLY_FEE_FCFA,
      dueDate,
    },
    update: {},
  });

  if (due.status !== 'paid' && due.dueDate < new Date() && due.lateFee === 0) {
    return prisma.membershipDue.update({
      where: { id: due.id },
      data: { status: 'late', lateFee: LATE_FEE_FCFA },
    });
  }
  return due;
}

export async function getWorkspace(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  const contract = await prisma.memberContract.findUnique({ where: { userId: clerkId } });
  const due = user ? await ensureCurrentDue(user) : null;
  const enrollments = await prisma.moduleEnrollment.findMany({
    where: { userId: clerkId },
    include: { module: { select: { id: true, name: true } } },
  });
  return {
    contractAccepted: contract?.version === CONTRACT_VERSION,
    contractAcceptedAt: contract?.acceptedAt ?? null,
    due: due
      ? {
          id: due.id,
          period: due.period,
          baseAmount: due.baseAmount,
          lateFee: due.lateFee,
          total: due.baseAmount + due.lateFee,
          status: due.status,
          dueDate: due.dueDate,
        }
      : null,
    modules: enrollments.map((e) => ({
      id: e.module.id,
      name: e.module.name,
      level: e.level,
    })),
  };
}

export async function acceptContract(userId: string) {
  return prisma.memberContract.upsert({
    where: { userId },
    create: { userId, version: CONTRACT_VERSION },
    update: { version: CONTRACT_VERSION, acceptedAt: new Date() },
  });
}

export async function listDues() {
  const users = await prisma.user.findMany({ take: 300 });
  for (const user of users) {
    await ensureCurrentDue(user);
  }
  return prisma.membershipDue.findMany({
    where: { period: periodKey() },
    orderBy: [{ status: 'asc' }, { userName: 'asc' }],
  });
}

export async function markDuePaid(id: string) {
  return prisma.membershipDue.update({
    where: { id },
    data: { status: 'paid', paidAt: new Date() },
  });
}

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function rotateAttendanceCode(activityId: string) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new Error('Activité introuvable');

  const now = new Date();
  if (
    activity.attendanceCode &&
    activity.attendanceCodeExpiresAt &&
    activity.attendanceCodeExpiresAt > now
  ) {
    return {
      code: activity.attendanceCode,
      expiresAt: activity.attendanceCodeExpiresAt,
    };
  }

  const code = randomCode();
  const expiresAt = new Date(now.getTime() + 10_000);
  await prisma.activity.update({
    where: { id: activityId },
    data: { attendanceCode: code, attendanceCodeExpiresAt: expiresAt },
  });
  return { code, expiresAt };
}

export async function checkInWithCode(input: {
  activityId: string;
  code: string;
  userId: string;
  userName: string;
  userEmail: string;
}) {
  const activity = await prisma.activity.findUnique({ where: { id: input.activityId } });
  if (!activity?.attendanceCode || !activity.attendanceCodeExpiresAt) {
    throw new Error('Aucune session de présence ouverte');
  }
  if (activity.attendanceCodeExpiresAt < new Date() || activity.attendanceCode !== input.code.trim()) {
    throw new Error('Code invalide ou expiré');
  }

  const registration = await prisma.activityRegistration.findUnique({
    where: { activityId_userId: { activityId: input.activityId, userId: input.userId } },
  });

  await prisma.attendance.upsert({
    where: { activityId_userId: { activityId: input.activityId, userId: input.userId } },
    create: {
      activityId: input.activityId,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      isPresent: true,
      wasRegistered: Boolean(registration),
      markedBy: 'qr-checkin',
      markedByName: 'QR',
    },
    update: {
      isPresent: true,
      markedAt: new Date(),
      markedBy: 'qr-checkin',
      markedByName: 'QR',
    },
  });

  return { ok: true };
}
