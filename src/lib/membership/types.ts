import { Document } from 'mongoose';

export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export interface IMembershipApplication extends Document {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  motivations: string;
  status: MembershipStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMembershipInput {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  motivations: string;
}

export interface ReviewApplicationInput {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
