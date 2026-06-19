import { prisma } from '@/lib/prisma';

export async function upsertUserFromClerk(data: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roleLevel?: number;
}) {
  return prisma.user.upsert({
    where: { clerkId: data.clerkId },
    create: {
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      role: data.role || 'membre',
      roleLevel: data.roleLevel || 1,
      memberStatus: 'pending',
    },
    update: {
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.roleLevel !== undefined ? { roleLevel: data.roleLevel } : {}),
    },
  });
}

export async function deleteUserByClerkId(clerkId: string) {
  try {
    await prisma.user.delete({ where: { clerkId } });
    return true;
  } catch {
    return false;
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function updateOnboarding(clerkId: string, step: number, done = false) {
  return prisma.user.update({
    where: { clerkId },
    data: { onboardingStep: step, onboardingDone: done },
  });
}

export async function getMemberStats() {
  const [active, pending, total] = await Promise.all([
    prisma.user.count({ where: { memberStatus: 'active' } }),
    prisma.user.count({ where: { memberStatus: 'pending' } }),
    prisma.user.count(),
  ]);
  return { active, pending, total };
}

export async function globalSearch(query: string, limit = 10) {
  const q = query.trim();
  if (!q) return { resources: [], events: [], threads: [], projects: [], members: [] };

  const [resources, events, threads, projects, members] = await Promise.all([
    prisma.resource.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, title: true, type: true, categoryId: true },
    }),
    prisma.event.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, title: true, date: true, location: true },
    }),
    prisma.thread.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, title: true, categoryId: true, replyCount: true },
    }),
    prisma.project.findMany({
      where: {
        published: true,
        OR: [
          { titleEn: { contains: q, mode: 'insensitive' } },
          { titleFr: { contains: q, mode: 'insensitive' } },
          { descEn: { contains: q, mode: 'insensitive' } },
          { descFr: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, titleEn: true, titleFr: true },
    }),
    prisma.user.findMany({
      where: {
        memberStatus: 'active',
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, clerkId: true, firstName: true, lastName: true, email: true, role: true },
    }),
  ]);

  return {
    resources,
    events,
    threads,
    projects,
    members: members.map((m) => ({
      id: m.clerkId,
      name: `${m.firstName} ${m.lastName}`.trim() || m.email,
      email: m.email,
      role: m.role,
    })),
  };
}

export async function getRecentActivity(limit = 10) {
  const [threads, resources, events, registrations] = await Promise.all([
    prisma.thread.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, title: true, authorName: true, createdAt: true },
    }),
    prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, title: true, type: true, createdAt: true },
    }),
    prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, title: true, date: true, createdAt: true },
    }),
    prisma.eventRegistration.findMany({
      orderBy: { registeredAt: 'desc' },
      take: limit,
      select: { id: true, userName: true, eventId: true, registeredAt: true },
    }),
  ]);

  type ActivityItem = {
    type: 'thread' | 'resource' | 'event' | 'registration';
    id: string;
    title: string;
    subtitle?: string;
    date: string;
  };

  const items: ActivityItem[] = [
    ...threads.map((t) => ({
      type: 'thread' as const,
      id: t.id,
      title: t.title,
      subtitle: t.authorName,
      date: t.createdAt.toISOString(),
    })),
    ...resources.map((r) => ({
      type: 'resource' as const,
      id: r.id,
      title: r.title,
      subtitle: r.type,
      date: r.createdAt.toISOString(),
    })),
    ...events.map((e) => ({
      type: 'event' as const,
      id: e.id,
      title: e.title,
      date: e.createdAt.toISOString(),
    })),
    ...registrations.map((r) => ({
      type: 'registration' as const,
      id: r.id,
      title: `Inscription: ${r.userName}`,
      date: r.registeredAt.toISOString(),
    })),
  ];

  return items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
