import { connectToDatabase } from '@/lib/mongodb/client';
import { Thread, Reply } from './models';
import { CATEGORIES as FORUM_CATEGORIES, TAGS as FORUM_TAGS } from './categories';
import type {
  ThreadWithAuthor,
  ReplyWithAuthor,
  CreateThreadInput,
  CreateReplyInput,
  ThreadFilters,
  PaginationParams,
  PaginatedResponse,
  ICategory,
} from './types';

// Re-export for backwards compatibility
export { CATEGORIES, TAGS } from './categories';

// Helper pour transformer un thread MongoDB en format API
function transformThread(doc: any): ThreadWithAuthor {
  const category = FORUM_CATEGORIES.find(c => c.id === doc.categoryId);
  return {
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    authorId: doc.authorId,
    authorName: doc.authorName,
    categoryId: doc.categoryId,
    categoryName: category?.name.en || 'Unknown',
    categoryColor: category?.color || 'text-gray-400',
    tags: doc.tags || [],
    views: doc.views || 0,
    isPinned: doc.isPinned || false,
    isLocked: doc.isLocked || false,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    replyCount: doc.replyCount || 0,
  };
}

// Helper pour transformer une réponse
function transformReply(doc: any): ReplyWithAuthor {
  return {
    id: doc._id.toString(),
    threadId: doc.threadId,
    authorId: doc.authorId,
    authorName: doc.authorName,
    content: doc.content,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    isEdited: doc.isEdited || false,
  };
}

// === THREADS ===

export async function getThreads(
  filters: ThreadFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<ThreadWithAuthor>> {
  await connectToDatabase();

  const query: any = {};

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.tag) {
    query.tags = filters.tag;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Tri
  let sort: any = { isPinned: -1, createdAt: -1 };
  if (filters.sort === 'oldest') {
    sort = { isPinned: -1, createdAt: 1 };
  } else if (filters.sort === 'popular') {
    sort = { isPinned: -1, views: -1 };
  }

  const skip = (pagination.page - 1) * pagination.limit;

  const [threads, total] = await Promise.all([
    Thread.find(query).sort(sort).skip(skip).limit(pagination.limit).lean(),
    Thread.countDocuments(query),
  ]);

  return {
    data: threads.map(transformThread),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getThreadById(id: string): Promise<ThreadWithAuthor | null> {
  await connectToDatabase();

  const thread = await Thread.findById(id).lean();
  if (!thread) return null;

  // Incrémenter les vues
  await Thread.findByIdAndUpdate(id, { $inc: { views: 1 } });

  return transformThread(thread);
}

export async function createThread(
  input: CreateThreadInput,
  authorId: string,
  authorName: string
): Promise<ThreadWithAuthor> {
  await connectToDatabase();

  const thread = await Thread.create({
    title: input.title,
    content: input.content,
    authorId,
    authorName,
    categoryId: input.categoryId,
    tags: input.tags,
    views: 0,
    isPinned: false,
    isLocked: false,
    replyCount: 0,
  });

  return transformThread(thread);
}

export async function updateThread(
  id: string,
  updates: Partial<CreateThreadInput>
): Promise<ThreadWithAuthor | null> {
  await connectToDatabase();

  const thread = await Thread.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).lean();

  return thread ? transformThread(thread) : null;
}

export async function deleteThread(id: string): Promise<boolean> {
  await connectToDatabase();

  const result = await Thread.findByIdAndDelete(id);
  // Supprimer aussi les réponses associées
  await Reply.deleteMany({ threadId: id });

  return !!result;
}

export async function togglePinThread(id: string): Promise<ThreadWithAuthor | null> {
  await connectToDatabase();

  const thread = await Thread.findById(id);
  if (!thread) return null;

  thread.isPinned = !thread.isPinned;
  await thread.save();

  return transformThread(thread);
}

export async function toggleLockThread(id: string): Promise<ThreadWithAuthor | null> {
  await connectToDatabase();

  const thread = await Thread.findById(id);
  if (!thread) return null;

  thread.isLocked = !thread.isLocked;
  await thread.save();

  return transformThread(thread);
}

// === REPLIES ===

export async function getRepliesByThreadId(
  threadId: string,
  pagination: PaginationParams = { page: 1, limit: 20 }
): Promise<PaginatedResponse<ReplyWithAuthor>> {
  await connectToDatabase();

  const skip = (pagination.page - 1) * pagination.limit;

  const [replies, total] = await Promise.all([
    Reply.find({ threadId }).sort({ createdAt: 1 }).skip(skip).limit(pagination.limit).lean(),
    Reply.countDocuments({ threadId }),
  ]);

  return {
    data: replies.map(transformReply),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function createReply(
  input: CreateReplyInput,
  threadId: string,
  authorId: string,
  authorName: string
): Promise<ReplyWithAuthor> {
  await connectToDatabase();

  const [reply] = await Promise.all([
    Reply.create({
      threadId,
      authorId,
      authorName,
      content: input.content,
    }),
    Thread.findByIdAndUpdate(threadId, {
      $inc: { replyCount: 1 },
      updatedAt: new Date(),
    }),
  ]);

  return transformReply(reply);
}

export async function updateReply(
  id: string,
  content: string
): Promise<ReplyWithAuthor | null> {
  await connectToDatabase();

  const reply = await Reply.findByIdAndUpdate(
    id,
    { content, isEdited: true, updatedAt: new Date() },
    { new: true }
  ).lean();

  return reply ? transformReply(reply) : null;
}

export async function deleteReply(id: string): Promise<boolean> {
  await connectToDatabase();

  const reply = await Reply.findByIdAndDelete(id);
  if (reply) {
    // Décrémenter le compteur de réponses
    await Thread.findByIdAndUpdate(reply.threadId, {
      $inc: { replyCount: -1 },
    });
  }

  return !!reply;
}

// === STATS ===

export async function getForumStats() {
  await connectToDatabase();

  const [totalThreads, totalReplies, categoryStats] = await Promise.all([
    Thread.countDocuments(),
    Reply.countDocuments(),
    Thread.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    totalThreads,
    totalReplies,
    categoryStats: categoryStats.reduce((acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
}
