import { connectToDatabase } from '@/lib/mongodb/client';
import { MembershipApplication } from './models';
import type { CreateMembershipInput, ReviewApplicationInput } from './types';

// Helper pour transformer une candidature
function transformApplication(doc: any) {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    fullName: `${doc.firstName} ${doc.lastName}`,
    email: doc.email,
    whatsapp: doc.whatsapp,
    motivations: doc.motivations,
    requestedRole: doc.requestedRole,
    status: doc.status,
    reviewedBy: doc.reviewedBy,
    reviewedAt: doc.reviewedAt?.toISOString() || null,
    rejectionReason: doc.rejectionReason,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// Créer une nouvelle candidature
export async function createApplication(
  input: CreateMembershipInput
) {
  await connectToDatabase();

  const application = await MembershipApplication.create(input);
  return transformApplication(application);
}

// Récupérer toutes les candidatures (avec filtres)
export async function getApplications(options: {
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  await connectToDatabase();

  const { status, page = 1, limit = 10 } = options;
  const query: any = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    MembershipApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MembershipApplication.countDocuments(query),
  ]);

  return {
    data: applications.map(transformApplication),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Récupérer une candidature par ID
export async function getApplicationById(id: string) {
  await connectToDatabase();

  const application = await MembershipApplication.findById(id).lean();
  if (!application) return null;

  return transformApplication(application);
}

// Récupérer une candidature par email
export async function getApplicationByEmail(email: string) {
  await connectToDatabase();

  const application = await MembershipApplication.findOne({ email }).lean();
  if (!application) return null;

  return transformApplication(application);
}

// Vérifier si un email a déjà une candidature
export async function hasPendingApplication(email: string): Promise<boolean> {
  await connectToDatabase();

  const application = await MembershipApplication.findOne({
    email,
    status: { $in: ['pending', 'approved'] },
  });

  return !!application;
}

// Réviser une candidature (approuver/rejeter)
export async function reviewApplication(
  id: string,
  input: ReviewApplicationInput,
  reviewerId: string
) {
  await connectToDatabase();

  const application = await MembershipApplication.findByIdAndUpdate(
    id,
    {
      status: input.status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: input.status === 'rejected' ? input.rejectionReason : null,
    },
    { new: true }
  ).lean();

  if (!application) return null;

  return transformApplication(application);
}

// Statistiques des candidatures
export async function getApplicationStats() {
  await connectToDatabase();

  const [pending, approved, rejected, total] = await Promise.all([
    MembershipApplication.countDocuments({ status: 'pending' }),
    MembershipApplication.countDocuments({ status: 'approved' }),
    MembershipApplication.countDocuments({ status: 'rejected' }),
    MembershipApplication.countDocuments(),
  ]);

  return {
    pending,
    approved,
    rejected,
    total,
  };
}

// Supprimer une candidature
export async function deleteApplication(id: string): Promise<boolean> {
  await connectToDatabase();

  const result = await MembershipApplication.findByIdAndDelete(id);
  return !!result;
}
