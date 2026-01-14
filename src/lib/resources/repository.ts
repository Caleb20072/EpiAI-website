import { connectToDatabase } from '@/lib/mongodb/client';
import { Resource } from './models';
import { CATEGORIES as RES_CATEGORIES, TAGS as RES_TAGS } from './categories';
import type {
  ResourceWithDetails,
  CreateResourceInput,
  ResourceFilters,
  PaginationParams,
  PaginatedResponse,
  ICategory,
} from './types';

// Re-export for backwards compatibility
export { CATEGORIES, TAGS } from './categories';

// Difficulté colors
const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  intermediate: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  advanced: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

// Type icons
const TYPE_ICONS: Record<string, string> = {
  pdf: 'FileText',
  code: 'Code',
  video: 'Play',
  article: 'BookOpen',
  course: 'GraduationCap',
  dataset: 'Database',
};

// Helper pour transformer une resource MongoDB en format API
function transformResource(doc: any): ResourceWithDetails {
  const category = RES_CATEGORIES.find(c => c.id === doc.categoryId);
  const difficultyColors = DIFFICULTY_COLORS[doc.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner;

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    type: doc.type,
    url: doc.url,
    fileUrl: doc.fileUrl,
    fileSize: doc.fileSize,
    fileType: doc.fileType,
    thumbnailUrl: doc.thumbnailUrl,
    categoryId: doc.categoryId,
    categoryName: category?.name.en || 'General',
    categoryColor: category?.color || 'text-gray-400',
    tags: doc.tags || [],
    difficulty: doc.difficulty || 'beginner',
    difficultyColor: `${difficultyColors.bg} ${difficultyColors.text} ${difficultyColors.border}`,
    author: doc.author,
    duration: doc.duration,
    isFeatured: doc.isFeatured || false,
    isPublished: doc.isPublished !== false,
    viewCount: doc.viewCount || 0,
    downloadCount: doc.downloadCount || 0,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// === RESOURCES ===

export async function getResources(
  filters: ResourceFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
): Promise<PaginatedResponse<ResourceWithDetails>> {
  await connectToDatabase();

  const query: any = { isPublished: true };

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.tag) {
    query.tags = filters.tag;
  }

  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.featured) {
    query.isFeatured = true;
  }

  // Tri: featured first, then by date or popularity
  let sort: any = { isFeatured: -1, createdAt: -1 };

  const skip = (pagination.page - 1) * pagination.limit;

  const [resources, total] = await Promise.all([
    Resource.find(query).sort(sort).skip(skip).limit(pagination.limit).lean(),
    Resource.countDocuments(query),
  ]);

  return {
    data: resources.map(transformResource),
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export async function getResourceById(id: string): Promise<ResourceWithDetails | null> {
  await connectToDatabase();

  const resource = await Resource.findById(id).lean();
  if (!resource) return null;

  // Incrémenter les vues
  await Resource.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

  return transformResource(resource);
}

export async function getFeaturedResources(limit: number = 6): Promise<ResourceWithDetails[]> {
  await connectToDatabase();

  const resources = await Resource.find({
    isPublished: true,
    isFeatured: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return resources.map(transformResource);
}

export async function createResource(
  input: CreateResourceInput,
  creatorId: string
): Promise<ResourceWithDetails> {
  await connectToDatabase();

  const resource = await Resource.create({
    ...input,
    viewCount: 0,
    downloadCount: 0,
    isFeatured: false,
    isPublished: true,
    createdBy: creatorId,
  });

  return transformResource(resource);
}

export async function updateResource(
  id: string,
  updates: Partial<CreateResourceInput>
): Promise<ResourceWithDetails | null> {
  await connectToDatabase();

  const resource = await Resource.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).lean();

  return resource ? transformResource(resource) : null;
}

export async function deleteResource(id: string): Promise<boolean> {
  await connectToDatabase();

  const result = await Resource.findByIdAndDelete(id);
  return !!result;
}

export async function toggleFeatureResource(id: string): Promise<ResourceWithDetails | null> {
  await connectToDatabase();

  const resource = await Resource.findById(id);
  if (!resource) return null;

  resource.isFeatured = !resource.isFeatured;
  await resource.save();

  return transformResource(resource);
}

export async function incrementDownload(id: string): Promise<void> {
  await connectToDatabase();
  await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
}

export async function getUserResources(userId: string): Promise<ResourceWithDetails[]> {
  await connectToDatabase();

  const resources = await Resource.find({
    createdBy: userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  return resources.map(transformResource);
}

export async function getPopularResources(limit: number = 6): Promise<ResourceWithDetails[]> {
  await connectToDatabase();

  const resources = await Resource.find({
    isPublished: true,
  })
    .sort({ viewCount: -1 })
    .limit(limit)
    .lean();

  return resources.map(transformResource);
}

export async function getRecentResources(limit: number = 6): Promise<ResourceWithDetails[]> {
  await connectToDatabase();

  const resources = await Resource.find({
    isPublished: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return resources.map(transformResource);
}

// === STATS ===

export async function getResourcesStats() {
  await connectToDatabase();

  const [totalResources, pdfCount, codeCount, videoCount, articleCount, courseCount, datasetCount] = await Promise.all([
    Resource.countDocuments({ isPublished: true }),
    Resource.countDocuments({ isPublished: true, type: 'pdf' }),
    Resource.countDocuments({ isPublished: true, type: 'code' }),
    Resource.countDocuments({ isPublished: true, type: 'video' }),
    Resource.countDocuments({ isPublished: true, type: 'article' }),
    Resource.countDocuments({ isPublished: true, type: 'course' }),
    Resource.countDocuments({ isPublished: true, type: 'dataset' }),
  ]);

  return {
    totalResources,
    byType: {
      pdf: pdfCount,
      code: codeCount,
      video: videoCount,
      article: articleCount,
      course: courseCount,
      dataset: datasetCount,
    },
  };
}
