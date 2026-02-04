import { Document } from 'mongoose';

// Catégorie de ressource
export interface ICategory {
  id: string;
  slug: string;
  name: {
    en: string;
    fr: string;
  };
  description: {
    en: string;
    fr: string;
  };
  icon: string;
  color: string;
  bgColor: string;
  resourceCount: number;
}

// Ressource (Document MongoDB)
export interface IResource extends Document {
  title: string;
  description: string;
  type: 'pdf' | 'code' | 'video' | 'article' | 'course' | 'dataset';
  url: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  categoryId: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author?: string;
  duration?: string;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  downloadCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les API responses
export interface ResourceWithDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficultyColor: string;
  author?: string;
  duration?: string;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  downloadCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Pour les paramètres d'API
export interface CreateResourceInput {
  title: string;
  description: string;
  type: 'pdf' | 'code' | 'video' | 'article' | 'course' | 'dataset';
  url: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  categoryId: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  author?: string;
  duration?: string;
}

export interface ResourceFilters {
  categoryId?: string;
  type?: string;
  tag?: string;
  difficulty?: string;
  search?: string;
  featured?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
