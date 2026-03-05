import { connectToDatabase } from '@/lib/mongodb/client';
import { Activity, ActivityRegistration, Attendance } from './models';
import { Event } from '@/lib/events/models';
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
    id: doc._id.toString(),
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
    id: doc._id.toString(),
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
    id: doc._id.toString(),
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
  await connectToDatabase();

  const query: any = { isActive: true };
  const now = new Date();

  if (!showPast) {
    query.date = { $gte: now };
  }

  const sort: any = showPast ? { date: -1 } : { date: 1 };
  const skip = (pagination.page - 1) * pagination.limit;

  const [activities, total] = await Promise.all([
    Activity.find(query).sort(sort).skip(skip).limit(pagination.limit).lean(),
    Activity.countDocuments(query),
  ]);

  // Compter les inscriptions et vérifier si l'utilisateur est inscrit
  const activityIds = activities.map((a: any) => a._id.toString());

  const [registrationCounts, userRegistrations] = await Promise.all([
    ActivityRegistration.aggregate([
      { $match: { activityId: { $in: activityIds } } },
      { $group: { _id: '$activityId', count: { $sum: 1 } } },
    ]),
    userId
      ? ActivityRegistration.find({
          activityId: { $in: activityIds },
          userId,
        }).lean()
      : Promise.resolve([]),
  ]);

  const countMap = new Map(registrationCounts.map((r: any) => [r._id, r.count]));
  const userRegSet = new Set(userRegistrations.map((r: any) => r.activityId));

  return {
    data: activities.map((a: any) =>
      transformActivity(
        a,
        countMap.get(a._id.toString()) || 0,
        userRegSet.has(a._id.toString())
      )
    ),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getActivityById(id: string, userId?: string): Promise<IActivity | null> {
  await connectToDatabase();

  const activity = await Activity.findById(id).lean();
  if (!activity) return null;

  const [registeredCount, userReg] = await Promise.all([
    ActivityRegistration.countDocuments({ activityId: id }),
    userId
      ? ActivityRegistration.findOne({ activityId: id, userId }).lean()
      : Promise.resolve(null),
  ]);

  return transformActivity(activity, registeredCount, !!userReg);
}

export async function createActivity(
  input: CreateActivityInput,
  creatorId: string,
  creatorName: string
): Promise<IActivity> {
  await connectToDatabase();

  const activityDate = new Date(input.date);
  // Deadline d'inscription = 24h avant l'activité
  const registrationDeadline = new Date(activityDate.getTime() - 24 * 60 * 60 * 1000);

  const activity = await Activity.create({
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
  });

  // Créer l'event miroir côté Events
  const mirrorEvent = await Event.create({
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
    linkedActivityId: activity._id.toString(),
  });

  // Lier l'activité à l'event
  activity.linkedEventId = mirrorEvent._id.toString();
  await activity.save();

  return transformActivity(activity, 0, false);
}

export async function updateActivity(
  id: string,
  updates: Partial<CreateActivityInput>
): Promise<IActivity | null> {
  await connectToDatabase();

  const updateData: any = { ...updates };
  if (updates.date) {
    updateData.date = new Date(updates.date);
    // Recalculer la deadline
    updateData.registrationDeadline = new Date(new Date(updates.date).getTime() - 24 * 60 * 60 * 1000);
  }
  if (updates.endDate) updateData.endDate = new Date(updates.endDate);

  const activity = await Activity.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  ).lean();

  if (!activity) return null;

  const registeredCount = await ActivityRegistration.countDocuments({ activityId: id });
  return transformActivity(activity, registeredCount, false);
}

export async function deleteActivity(id: string): Promise<boolean> {
  await connectToDatabase();

  const activity = await Activity.findById(id).lean();
  const result = await Activity.findByIdAndDelete(id);
  await ActivityRegistration.deleteMany({ activityId: id });
  await Attendance.deleteMany({ activityId: id });

  // Supprimer l'event miroir s'il existe
  if (activity?.linkedEventId) {
    await Event.findByIdAndDelete(activity.linkedEventId);
    const { Registration } = await import('@/lib/events/models');
    await Registration.deleteMany({ eventId: activity.linkedEventId });
  }

  return !!result;
}

// === REGISTRATIONS ===

export async function registerForActivity(
  activityId: string,
  userId: string,
  userName: string,
  userEmail: string,
  forcedBy?: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const activity = await Activity.findById(activityId);
  if (!activity) return { success: false, error: 'Activity not found' };
  if (!activity.isActive) return { success: false, error: 'Activity is not active' };

  // Vérifier la deadline (sauf si inscription forcée par admin)
  if (!forcedBy) {
    const now = new Date();
    if (new Date(activity.registrationDeadline) <= now) {
      return { success: false, error: 'Registration deadline has passed (must register at least 24h before)' };
    }
    if (new Date(activity.date) <= now) {
      return { success: false, error: 'Activity has already passed' };
    }
  }

  // Vérifier inscription existante
  const existing = await ActivityRegistration.findOne({ activityId, userId }).lean();
  if (existing) return { success: false, error: 'Already registered' };

  await ActivityRegistration.create({
    activityId,
    userId,
    userName,
    userEmail,
    registeredAt: new Date(),
    registeredBy: forcedBy || undefined,
    isForcedRegistration: !!forcedBy,
  });

  return { success: true };
}

export async function unregisterFromActivity(
  activityId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const activity = await Activity.findById(activityId);
  if (!activity) return { success: false, error: 'Activity not found' };

  // Vérifier la deadline
  const now = new Date();
  if (new Date(activity.registrationDeadline) <= now) {
    return { success: false, error: 'Cannot unregister after deadline' };
  }

  const result = await ActivityRegistration.findOneAndDelete({ activityId, userId });
  if (!result) return { success: false, error: 'Registration not found' };

  return { success: true };
}

export async function getActivityRegistrations(activityId: string): Promise<IActivityRegistration[]> {
  await connectToDatabase();

  const registrations = await ActivityRegistration.find({ activityId })
    .sort({ registeredAt: -1 })
    .lean();

  return registrations.map(transformRegistration);
}

// === ATTENDANCE ===

export async function markAttendance(
  activityId: string,
  input: MarkAttendanceInput,
  adminId: string,
  adminName: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const activity = await Activity.findById(activityId);
  if (!activity) return { success: false, error: 'Activity not found' };

  // Vérifier si l'utilisateur était inscrit
  const registration = await ActivityRegistration.findOne({
    activityId,
    userId: input.userId,
  }).lean();

  const wasRegistered = !!registration;

  // Upsert l'attendance
  await Attendance.findOneAndUpdate(
    { activityId, userId: input.userId },
    {
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
    { upsert: true, new: true }
  );

  return { success: true };
}

export async function bulkMarkAttendance(
  activityId: string,
  attendances: MarkAttendanceInput[],
  adminId: string,
  adminName: string
): Promise<{ success: number; failed: number }> {
  await connectToDatabase();

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
  await connectToDatabase();

  const activity = await Activity.findById(activityId).lean();
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

  const attendances = await Attendance.find({ activityId }).sort({ userName: 1 }).lean();

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
  await connectToDatabase();

  const attendances = await Attendance.find({ userId }).sort({ createdAt: -1 }).lean();
  if (attendances.length === 0) return null;

  // Récupérer les titres d'activités
  const activityIds = [...new Set(attendances.map((a: any) => a.activityId))];
  const activities = await Activity.find({ _id: { $in: activityIds } }).lean();
  const activityMap = new Map(activities.map((a: any) => [a._id.toString(), a]));

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
  await connectToDatabase();

  // Agréger par userId
  const stats = await Attendance.aggregate([
    {
      $group: {
        _id: '$userId',
        userName: { $first: '$userName' },
        userEmail: { $first: '$userEmail' },
        totalPresent: { $sum: { $cond: ['$isPresent', 1, 0] } },
        totalAbsent: { $sum: { $cond: ['$isPresent', 0, 1] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { totalAbsent: -1 } },
  ]);

  return stats.map((s: any) => ({
    userId: s._id,
    userName: s.userName,
    userEmail: s.userEmail,
    totalPresent: s.totalPresent,
    totalAbsent: s.totalAbsent,
    attendanceRate: s.total > 0 ? (s.totalPresent / s.total) * 100 : 0,
    details: [],
  }));
}
