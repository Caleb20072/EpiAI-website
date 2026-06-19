import { prisma } from '@/lib/prisma';
import type { CreateMembershipInput, ReviewApplicationInput } from './types';

function transformApplication(doc: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  motivations: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: doc.id,
    firstName: doc.firstName,
    lastName: doc.lastName,
    fullName: `${doc.firstName} ${doc.lastName}`,
    email: doc.email,
    whatsapp: doc.whatsapp,
    motivations: doc.motivations,
    status: doc.status,
    reviewedBy: doc.reviewedBy,
    reviewedAt: doc.reviewedAt?.toISOString() || null,
    rejectionReason: doc.rejectionReason,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function createApplication(input: CreateMembershipInput) {
  const application = await prisma.membershipApplication.create({ data: input });
  return transformApplication(application);
}

export async function getApplications(options: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const { status, page = 1, limit = 10 } = options;
  const where = status && status !== 'all' ? { status: status as 'pending' | 'approved' | 'rejected' } : {};

  const [applications, total] = await Promise.all([
    prisma.membershipApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.membershipApplication.count({ where }),
  ]);

  return {
    data: applications.map(transformApplication),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getApplicationById(id: string) {
  const application = await prisma.membershipApplication.findUnique({ where: { id } });
  return application ? transformApplication(application) : null;
}

export async function getApplicationByEmail(email: string) {
  const application = await prisma.membershipApplication.findUnique({ where: { email: email.toLowerCase() } });
  return application ? transformApplication(application) : null;
}

export async function hasPendingApplication(email: string): Promise<boolean> {
  const application = await prisma.membershipApplication.findFirst({
    where: { email: email.toLowerCase(), status: { in: ['pending', 'approved'] } },
  });
  return !!application;
}

export async function reviewApplication(
  id: string,
  input: ReviewApplicationInput,
  reviewerId: string
) {
  const application = await prisma.membershipApplication.update({
    where: { id },
    data: {
      status: input.status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: input.status === 'rejected' ? input.rejectionReason : null,
    },
  });
  return transformApplication(application);
}

export async function getApplicationStats() {
  const [pending, approved, rejected, total] = await Promise.all([
    prisma.membershipApplication.count({ where: { status: 'pending' } }),
    prisma.membershipApplication.count({ where: { status: 'approved' } }),
    prisma.membershipApplication.count({ where: { status: 'rejected' } }),
    prisma.membershipApplication.count(),
  ]);
  return { pending, approved, rejected, total };
}

export async function deleteApplication(id: string): Promise<boolean> {
  try {
    await prisma.membershipApplication.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
