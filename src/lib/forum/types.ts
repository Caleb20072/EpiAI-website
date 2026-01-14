import { Document } from 'mongoose';

// Catégorie
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
  threadCount: number;
}

// Tag
export interface ITag {
  id: string;
  name: string;
  color: string;
  threadCount: number;
}

// Thread (Discussion)
export interface IThread extends Document {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  tags: string[];
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  replyCount: number;
}

// Reply (Réponse)
export interface IReply extends Document {
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
}

// Types pour les API responses
export interface ThreadWithAuthor {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  tags: string[];
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
}

export interface ReplyWithAuthor {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

// Pour les paramètres d'API
export interface CreateThreadInput {
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
}

export interface CreateReplyInput {
  content: string;
}

// Filtres pour la liste des threads
export interface ThreadFilters {
  categoryId?: string;
  tag?: string;
  search?: string;
  sort?: 'latest' | 'oldest' | 'popular';
}

// Pagination
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
