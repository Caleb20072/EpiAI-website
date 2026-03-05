import { connectToDatabase } from '@/lib/mongodb/client';
import { TeamMember } from './models';
import type { ITeamMember, CreateTeamMemberInput } from './types';

function transformTeamMember(doc: any): ITeamMember {
  return {
    id: doc._id.toString(),
    name: doc.name,
    role: doc.role,
    title: doc.title,
    section: doc.section,
    poleKey: doc.poleKey,
    description: doc.description,
    photoUrl: doc.photoUrl,
    socialLinks: {
      linkedin: doc.socialLinks?.linkedin,
      github: doc.socialLinks?.github,
      twitter: doc.socialLinks?.twitter,
    },
    displayOrder: doc.displayOrder || 0,
    isActive: doc.isActive ?? true,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// Récupérer tous les membres actifs (pour la page publique)
export async function getActiveTeamMembers(): Promise<ITeamMember[]> {
  await connectToDatabase();

  const members = await TeamMember.find({ isActive: true })
    .sort({ section: 1, displayOrder: 1 })
    .lean();

  return members.map(transformTeamMember);
}

// Récupérer tous les membres (pour l'admin)
export async function getAllTeamMembers(): Promise<ITeamMember[]> {
  await connectToDatabase();

  const members = await TeamMember.find()
    .sort({ section: 1, displayOrder: 1 })
    .lean();

  return members.map(transformTeamMember);
}

export async function getTeamMemberById(id: string): Promise<ITeamMember | null> {
  await connectToDatabase();

  const member = await TeamMember.findById(id).lean();
  return member ? transformTeamMember(member) : null;
}

export async function createTeamMember(input: CreateTeamMemberInput): Promise<ITeamMember> {
  await connectToDatabase();

  const member = await TeamMember.create({
    name: input.name,
    role: input.role,
    title: input.title,
    section: input.section,
    poleKey: input.poleKey,
    description: input.description,
    photoUrl: input.photoUrl,
    socialLinks: input.socialLinks || {},
    displayOrder: input.displayOrder || 0,
    isActive: true,
  });

  return transformTeamMember(member);
}

export async function updateTeamMember(
  id: string,
  updates: Partial<CreateTeamMemberInput> & { isActive?: boolean }
): Promise<ITeamMember | null> {
  await connectToDatabase();

  const member = await TeamMember.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).lean();

  return member ? transformTeamMember(member) : null;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  await connectToDatabase();

  const result = await TeamMember.findByIdAndDelete(id);
  return !!result;
}
