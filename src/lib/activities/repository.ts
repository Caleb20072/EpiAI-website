import { prisma } from '@/lib/prisma';
import type {
  IActivity,
  IActivityRegistration,
  IAttendance,
  CreateActivityInput,
  MarkAttendanceInput,
  AttendanceReport,
  MemberAttendanceSummary,
  PaginationParams,
  PaginatedResponse,
} from './types';

// === TRANSFORM HELPERS ===

function transformActivity(doc: any, registeredCount: number = 0, isRegistered: boolean = false): IActivity {
  const now = new Date();
  const activityDate = new Date(doc.date);
  const deadline = new Date(doc.registrationDeadline);
  const isPast = activityDate < now;
  const canRegister = deadline > now && !isPast;

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    date: doc.date.toISOString(),
    endDate: doc.endDate?.toISOString(),
    location: doc.location,
    isOnline: doc.isOnline || false,
    onlineLink: doc.onlineLink,
    registrationDeadline: doc.registrationDeadline.toISOString(),
    isMandatory: doc.isMandatory ?? true,
    isActive: doc.isActive ?? true,
    createdBy: doc.createdBy,
    createdByName: doc.createdByName,
    registeredCount,
    isRegistered,
    isPast,
    canRegister,
    linkedEventId: doc.linkedEventId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function transformRegistration(doc: any): IActivityRegistration {
  return {
    id: doc.id,
    activityId: doc.activityId,
    userId: doc.userId,
    userName: doc.userName,
    userEmail: doc.userEmail,
    registeredAt: doc.registeredAt.toISOString(),
    registeredBy: doc.registeredBy,
    isForcedRegistration: doc.isForcedRegistration || false,
  };
}

function transformAttendance(doc: any): IAttendance {
  return {
    id: doc.id,
    activityId: doc.activityId,
    userId: doc.userId,
    userName: doc.userName,
    userEmail: doc.userEmail,
    isPresent: doc.isPresent,
    wasRegistered: doc.wasRegistered,
    markedBy: doc.markedBy,
    markedByName: doc.markedByName,
    markedAt: doc.markedAt.toISOString(),
    notes: doc.notes,
  };
}

// === ACTIVITIES ===

export async function getActivities(
  pagination: PaginationParams = { page: 1, limit: 10 },
  userId?: string,
  showPast: boolean = false,
): Promise<PaginatedResponse<IActivity>> {
  const where: any = { isActive: true };
  const now = new Date();

  if (!showPast) {
    where.date = { gte: now };
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { date: showPast ? 'desc' : 'asc' },
      skip,
      take: pagination.limit,
    }),
    prisma.activity.count({ where }),
  ]);

  const activityIds = activities.map((a: any) => a.id);

  const [registrationCounts, userRegistrations] = activityIds.length
    ? await Promise.all([
        prisma.activityRegistration.groupBy({
          by: ['activityId'],
          where: { activityId: { in: activityIds } },
          _count: { _all: true },
        }),
        userId
          ? prisma.activityRegistration.findMany({
              where: {
                activityId: { in: activityIds },
                userId,
              },
              select: { activityId: true },
            })
          : Promise.resolve([]),
      ])
    : [[], []];

  const countMap = new Map(registrationCounts.map((r: any) => [r.activityId, r._count._all]));
  const userRegSet = new Set(userRegistrations.map((r: any) => r.activityId));

  return {
    data: activities.map((a: any) =>
      transformActivity(
        a,
        countMap.get(a.id) || 0,
        userRegSet.has(a.id)
      )
    ),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getActivityById(id: string, userId?: string): Promise<IActivity | null> {
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) return null;

  const [registeredCount, userReg] = await Promise.all([
    prisma.activityRegistration.count({ where: { activityId: id } }),
    userId
      ? prisma.activityRegistration.findUnique({
          where: {
            activityId_userId: {
              activityId: id,
              userId,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return transformActivity(activity, registeredCount, !!userReg);
}

export async function createActivity(
  input: CreateActivityInput,
  creatorId: string,
  creatorName: string
): Promise<IActivity> {
  const activityDate = new Date(input.date);
  const registrationDeadline = new Date(activityDate.getTime() - 24 * 60 * 60 * 1000);

  const activity = await prisma.$transaction(async tx => {
    const createdActivity = await tx.activity.create({
      data: {
        title: input.title,
        description: input.description,
        date: activityDate,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        location: input.location,
        isOnline: input.isOnline || false,
        onlineLink: input.onlineLink,
        registrationDeadline,
        isMandatory: input.isMandatory ?? true,
        isActive: true,
        createdBy: creatorId,
        createdByName: creatorName,
      },
    });

    const mirrorEvent = await tx.event.create({
      data: {
        title: input.title,
        description: input.description,
        content: input.description,
        categoryId: 'meetup',
        date: activityDate,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        location: input.location,
        isOnline: input.isOnline || false,
        onlineLink: input.onlineLink,
        capacity: 9999,
        registeredCount: 0,
        isPublished: true,
        isFeatured: false,
        createdBy: creatorId,
        linkedActivityId: createdActivity.id,
      },
    });

    return tx.activity.update({
      where: { id: createdActivity.id },
      data: { linkedEventId: mirrorEvent.id },
    });
  });

  return transformActivity(activity, 0, false);
}

export async function updateActivity(
  id: string,
  updates: Partial<CreateActivityInput>
): Promise<IActivity | null> {
  const existing = await prisma.activity.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return null;

  const updateData: any = { ...updates };
  if (updates.date) {
    updateData.date = new Date(updates.date);
    updateData.registrationDeadline = new Date(new Date(updates.date).getTime() - 24 * 60 * 60 * 1000);
  }
  if (updates.endDate) updateData.endDate = new Date(updates.endDate);

  const activity = await prisma.activity.update({
    where: { id },
    data: updateData,
  });

  const registeredCount = await prisma.activityRegistration.count({ where: { activityId: id } });
  return transformActivity(activity, registeredCount, false);
}

export async function deleteActivity(id: string): Promise<boolean> {
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) return false;

  await prisma.$transaction(async tx => {
    await tx.activity.delete({ where: { id } });
    await tx.activityRegistration.deleteMany({ where: { activityId: id } });
    await tx.attendance.deleteMany({ where: { activityId: id } });

    if (activity.linkedEventId) {
      await tx.event.deleteMany({ where: { id: activity.linkedEventId } });
      await tx.eventRegistration.deleteMany({ where: { eventId: activity.linkedEventId } });
    }
  });

  return true;
}

// === REGISTRATIONS ===

export async function registerForActivity(
  activityId: string,
  userId: string,
  userName: string,
  userEmail: string,
  forcedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return { success: false, error: 'Activity not found' };
  if (!activity.isActive) return { success: false, error: 'Activity is not active' };

  if (!forcedBy) {
    const now = new Date();
    if (new Date(activity.registrationDeadline) <= now) {
      return { success: false, error: 'Registration deadline has passed (must register at least 24h before)' };
    }
    if (new Date(activity.date) <= now) {
      return { success: false, error: 'Activity has already passed' };
    }
  }

  const existing = await prisma.activityRegistration.findUnique({
    where: {
      activityId_userId: {
        activityId,
        userId,
      },
    },
  });
  if (existing) return { success: false, error: 'Already registered' };

  await prisma.activityRegistration.create({
    data: {
      activityId,
      userId,
      userName,
      userEmail,
      registeredAt: new Date(),
      registeredBy: forcedBy || undefined,
      isForcedRegistration: !!forcedBy,
    },
  });

  return { success: true };
}

export async function unregisterFromActivity(
  activityId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return { success: false, error: 'Activity not found' };

  const now = new Date();
  if (new Date(activity.registrationDeadline) <= now) {
    return { success: false, error: 'Cannot unregister after deadline' };
  }

  const result = await prisma.activityRegistration.deleteMany({ where: { activityId, userId } });
  if (result.count === 0) return { success: false, error: 'Registration not found' };

  return { success: true };
}

export async function getActivityRegistrations(activityId: string): Promise<IActivityRegistration[]> {
  const registrations = await prisma.activityRegistration.findMany({
    where: { activityId },
    orderBy: { registeredAt: 'desc' },
  });

  return registrations.map(transformRegistration);
}

// === ATTENDANCE ===

export async function markAttendance(
  activityId: string,
  input: MarkAttendanceInput,
  adminId: string,
  adminName: string
): Promise<{ success: boolean; error?: string }> {
  const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { id: true } });
  if (!activity) return { success: false, error: 'Activity not found' };

  const registration = await prisma.activityRegistration.findUnique({
    where: {
      activityId_userId: {
        activityId,
        userId: input.userId,
      },
    },
    select: { id: true },
  });

  const wasRegistered = !!registration;

  await prisma.attendance.upsert({
    where: {
      activityId_userId: {
        activityId,
        userId: input.userId,
      },
    },
    create: {
      activityId,
      userId: input.userId,
      userName: input.userName,
      userEmail: input.userEmail,
      isPresent: input.isPresent,
      wasRegistered,
      markedBy: adminId,
      markedByName: adminName,
      markedAt: new Date(),
      notes: input.notes,
    },
    update: {
      userName: input.userName,
      userEmail: input.userEmail,
      isPresent: input.isPresent,
      wasRegistered,
      markedBy: adminId,
      markedByName: adminName,
      markedAt: new Date(),
      notes: input.notes,
    },
  });

  return { success: true };
}

export async function bulkMarkAttendance(
  activityId: string,
  attendances: MarkAttendanceInput[],
  adminId: string,
  adminName: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const input of attendances) {
    const result = await markAttendance(activityId, input, adminId, adminName);
    if (result.success) success++;
    else failed++;
  }

  return { success, failed };
}

export async function getActivityAttendance(activityId: string): Promise<AttendanceReport> {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) {
    return {
      activityId,
      activityTitle: 'Unknown',
      activityDate: '',
      presentList: [],
      absentList: [],
      totalPresent: 0,
      totalAbsent: 0,
    };
  }

  const attendances = await prisma.attendance.findMany({
    where: { activityId },
    orderBy: { userName: 'asc' },
  });

  const presentList = attendances.filter((a: any) => a.isPresent).map(transformAttendance);
  const absentList = attendances.filter((a: any) => !a.isPresent).map(transformAttendance);

  return {
    activityId,
    activityTitle: activity.title,
    activityDate: activity.date.toISOString(),
    presentList,
    absentList,
    totalPresent: presentList.length,
    totalAbsent: absentList.length,
  };
}

export async function getMemberAttendanceSummary(userId: string): Promise<MemberAttendanceSummary | null> {
  const attendances = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  if (attendances.length === 0) return null;

  const activityIds = [...new Set(attendances.map((a: any) => a.activityId))];
  const activities = activityIds.length
    ? await prisma.activity.findMany({ where: { id: { in: activityIds } } })
    : [];
  const activityMap = new Map(activities.map((a: any) => [a.id, a]));

  const first = attendances[0] as any;
  const totalPresent = attendances.filter((a: any) => a.isPresent).length;
  const totalAbsent = attendances.filter((a: any) => !a.isPresent).length;

  return {
    userId,
    userName: first.userName,
    userEmail: first.userEmail,
    totalPresent,
    totalAbsent,
    attendanceRate: attendances.length > 0 ? (totalPresent / attendances.length) * 100 : 0,
    details: attendances.map((a: any) => {
      const activity = activityMap.get(a.activityId);
      return {
        activityId: a.activityId,
        activityTitle: activity?.title || 'Unknown',
        activityDate: activity?.date?.toISOString() || '',
        isPresent: a.isPresent,
        wasRegistered: a.wasRegistered,
      };
    }),
  };
}

export async function getAllMembersAttendanceSummary(): Promise<MemberAttendanceSummary[]> {
  const attendances = await prisma.attendance.findMany();
  const summaryMap = new Map<
    string,
    {
      userId: string;
      userName: string;
      userEmail: string;
      totalPresent: number;
      totalAbsent: number;
      total: number;
    }
  >();

  for (const attendance of attendances) {
    const current = summaryMap.get(attendance.userId) || {
      userId: attendance.userId,
      userName: attendance.userName,
      userEmail: attendance.userEmail,
      totalPresent: 0,
      totalAbsent: 0,
      total: 0,
    };

    if (attendance.isPresent) current.totalPresent += 1;
    else current.totalAbsent += 1;
    current.total += 1;
    summaryMap.set(attendance.userId, current);
  }

  return Array.from(summaryMap.values())
    .sort((a, b) => b.totalAbsent - a.totalAbsent)
    .map(s => ({
      userId: s.userId,
      userName: s.userName,
      userEmail: s.userEmail,
      totalPresent: s.totalPresent,
      totalAbsent: s.totalAbsent,
      attendanceRate: s.total > 0 ? (s.totalPresent / s.total) * 100 : 0,
      details: [],
    }));
}
