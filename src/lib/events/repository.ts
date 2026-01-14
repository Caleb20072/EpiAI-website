import { connectToDatabase } from '@/lib/mongodb/client';
import { Event, Registration } from './models';
import { CATEGORIES as EVENT_CATEGORIES } from './categories';
import type {
  EventWithDetails,
  RegistrationWithUser,
  CreateEventInput,
  EventFilters,
  PaginationParams,
  PaginatedResponse,
  ICategory,
} from './types';

// Re-export for backwards compatibility
export { CATEGORIES } from './categories';

// Helper pour transformer un event MongoDB en format API
function transformEvent(doc: any, isRegistered: boolean = false): EventWithDetails {
  const category = EVENT_CATEGORIES.find(c => c.id === doc.categoryId);
  const now = new Date();
  const eventDate = new Date(doc.date);
  const isPast = eventDate < now;

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    content: doc.content,
    categoryId: doc.categoryId,
    categoryName: category?.name.en || 'Event',
    categoryColor: category?.color || 'text-gray-400',
    categoryIcon: category?.icon || 'Calendar',
    date: doc.date.toISOString(),
    endDate: doc.endDate?.toISOString(),
    location: doc.location,
    isOnline: doc.isOnline || false,
    onlineLink: doc.onlineLink,
    capacity: doc.capacity,
    registeredCount: doc.registeredCount || 0,
    spotsLeft: Math.max(0, doc.capacity - (doc.registeredCount || 0)),
    imageUrl: doc.imageUrl,
    gallery: doc.gallery || [],
    isPublished: doc.isPublished || false,
    isFeatured: doc.isFeatured || false,
    isRegistered,
    isPast,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// Helper pour transformer une registration
function transformRegistration(doc: any): RegistrationWithUser {
  return {
    id: doc._id.toString(),
    eventId: doc.eventId,
    userId: doc.userId,
    userName: doc.userName,
    userEmail: doc.userEmail,
    status: doc.status,
    registeredAt: doc.registeredAt.toISOString(),
  };
}

// === EVENTS ===

export async function getEvents(
  filters: EventFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 },
  userId?: string
): Promise<PaginatedResponse<EventWithDetails>> {
  await connectToDatabase();

  const query: any = { isPublished: true };

  // Filtre par catégorie
  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  // Filtre upcoming/past
  const now = new Date();
  if (filters.upcoming) {
    query.date = { $gte: now };
  } else if (filters.past) {
    query.date = { $lt: now };
  }

  // Recherche textuelle
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Tri: événements à venir en premier, puis par date
  const sort: any = { date: filters.past ? -1 : 1, isFeatured: -1 };

  const skip = (pagination.page - 1) * pagination.limit;

  const [events, total] = await Promise.all([
    Event.find(query).sort(sort).skip(skip).limit(pagination.limit).lean(),
    Event.countDocuments(query),
  ]);

  // Si userId fourni, vérifier les inscriptions
  let registeredEventIds: Set<string> = new Set();
  if (userId) {
    const registrations = await Registration.find({
      userId,
      eventId: { $in: events.map(e => e._id.toString()) },
      status: 'registered',
    }).lean();
    registeredEventIds = new Set(registrations.map(r => r.eventId));
  }

  return {
    data: events.map(e => transformEvent(e, registeredEventIds.has(e._id.toString()))),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getEventById(id: string, userId?: string): Promise<EventWithDetails | null> {
  await connectToDatabase();

  const event = await Event.findById(id).lean();
  if (!event) return null;

  // Vérifier si l'utilisateur est inscrit
  let isRegistered = false;
  if (userId) {
    const registration = await Registration.findOne({
      eventId: id,
      userId,
      status: 'registered',
    }).lean();
    isRegistered = !!registration;
  }

  return transformEvent(event, isRegistered);
}

export async function getFeaturedEvents(limit: number = 3): Promise<EventWithDetails[]> {
  await connectToDatabase();

  const now = new Date();
  const events = await Event.find({
    isPublished: true,
    isFeatured: true,
    date: { $gte: now },
  })
    .sort({ date: 1 })
    .limit(limit)
    .lean();

  return events.map(e => transformEvent(e));
}

export async function createEvent(
  input: CreateEventInput,
  creatorId: string
): Promise<EventWithDetails> {
  await connectToDatabase();

  const event = await Event.create({
    title: input.title,
    description: input.description,
    content: input.content,
    categoryId: input.categoryId,
    date: new Date(input.date),
    endDate: input.endDate ? new Date(input.endDate) : undefined,
    location: input.location,
    isOnline: input.isOnline || false,
    onlineLink: input.onlineLink,
    capacity: input.capacity,
    imageUrl: input.imageUrl,
    gallery: input.gallery || [],
    isPublished: true,
    isFeatured: false,
    registeredCount: 0,
    createdBy: creatorId,
  });

  return transformEvent(event);
}

export async function updateEvent(
  id: string,
  updates: Partial<CreateEventInput>
): Promise<EventWithDetails | null> {
  await connectToDatabase();

  const updateData: any = { ...updates };
  if (updates.date) updateData.date = new Date(updates.date);
  if (updates.endDate) updateData.endDate = new Date(updates.endDate);

  const event = await Event.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  ).lean();

  return event ? transformEvent(event) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  await connectToDatabase();

  const result = await Event.findByIdAndDelete(id);
  // Supprimer les inscriptions
  await Registration.deleteMany({ eventId: id });

  return !!result;
}

export async function togglePublishEvent(id: string): Promise<EventWithDetails | null> {
  await connectToDatabase();

  const event = await Event.findById(id);
  if (!event) return null;

  event.isPublished = !event.isPublished;
  await event.save();

  return transformEvent(event);
}

// === REGISTRATIONS ===

export async function registerForEvent(
  eventId: string,
  userId: string,
  userName: string,
  userEmail: string
): Promise<{ success: boolean; event?: EventWithDetails; error?: string }> {
  await connectToDatabase();

  // Vérifier l'événement
  const event = await Event.findById(eventId);
  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  if (!event.isPublished) {
    return { success: false, error: 'Event is not available' };
  }

  if (event.date < new Date()) {
    return { success: false, error: 'Event has already passed' };
  }

  // Vérifier la capacité
  if (event.registeredCount >= event.capacity) {
    return { success: false, error: 'Event is full' };
  }

  // Vérifier inscription existante
  const existingReg = await Registration.findOne({
    eventId,
    userId,
  }).lean();

  if (existingReg) {
    if (existingReg.status === 'registered') {
      return { success: false, error: 'Already registered for this event' };
    }
    if (existingReg.status === 'cancelled') {
      // Réinscription
      await Registration.findByIdAndUpdate(existingReg._id, {
        status: 'registered',
        registeredAt: new Date(),
      });
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });
      return { success: true, event: transformEvent(event.toObject()) };
    }
  }

  // Créer l'inscription
  await Registration.create({
    eventId,
    userId,
    userName,
    userEmail,
    status: 'registered',
    registeredAt: new Date(),
  });

  // Incrémenter le compteur
  await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

  return { success: true, event: transformEvent(event.toObject()) };
}

export async function cancelRegistration(
  eventId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const registration = await Registration.findOne({
    eventId,
    userId,
    status: 'registered',
  }).lean();

  if (!registration) {
    return { success: false, error: 'No registration found' };
  }

  await Registration.findByIdAndUpdate(registration._id, { status: 'cancelled' });
  await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });

  return { success: true };
}

export async function getUserRegistrations(userId: string): Promise<RegistrationWithUser[]> {
  await connectToDatabase();

  const registrations = await Registration.find({
    userId,
    status: 'registered',
  }).sort({ registeredAt: -1 }).lean();

  return registrations.map(transformRegistration);
}

export async function getEventRegistrations(eventId: string): Promise<RegistrationWithUser[]> {
  await connectToDatabase();

  const registrations = await Registration.find({
    eventId,
    status: 'registered',
  }).sort({ registeredAt: -1 }).lean();

  return registrations.map(transformRegistration);
}

export async function isUserRegistered(eventId: string, userId: string): Promise<boolean> {
  await connectToDatabase();

  const registration = await Registration.findOne({
    eventId,
    userId,
    status: 'registered',
  }).lean();

  return !!registration;
}

// === STATS ===

export async function getEventStats() {
  await connectToDatabase();

  const now = new Date();

  const [upcomingCount, pastCount, totalRegistrations] = await Promise.all([
    Event.countDocuments({ isPublished: true, date: { $gte: now } }),
    Event.countDocuments({ isPublished: true, date: { $lt: now } }),
    Registration.countDocuments({ status: 'registered' }),
  ]);

  return {
    upcomingCount,
    pastCount,
    totalRegistrations,
  };
}
