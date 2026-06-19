import { prisma } from '@/lib/prisma';
import type { ITeamMember, CreateTeamMemberInput } from './types';
import type { TeamSection } from '@prisma/client';

function transformTeamMember(doc: {
  id: string;
  name: string;
  role: string;
  title: string | null;
  section: TeamSection;
  poleKey: string | null;
  description: string | null;
  photoUrl: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ITeamMember {
  return {
    id: doc.id,
    name: doc.name,
    role: doc.role,
    title: doc.title ?? undefined,
    section: doc.section,
    poleKey: doc.poleKey ?? undefined,
    description: doc.description ?? undefined,
    photoUrl: doc.photoUrl ?? undefined,
    socialLinks: {
      linkedin: doc.linkedin ?? undefined,
      github: doc.github ?? undefined,
      twitter: doc.twitter ?? undefined,
    },
    displayOrder: doc.displayOrder,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function getActiveTeamMembers(): Promise<ITeamMember[]> {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ section: 'asc' }, { displayOrder: 'asc' }],
  });
  return members.map(transformTeamMember);
}

/** Public pages: DB first, static fallback when empty or unavailable. */
export async function getTeamMembersForDisplay(): Promise<ITeamMember[]> {
  try {
    const members = await getActiveTeamMembers();
    if (members.length > 0) return members;
  } catch (error) {
    console.error('[team] Failed to load from database:', error);
  }

  const { DEFAULT_TEAM_MEMBERS } = await import('./seed-data');
  return DEFAULT_TEAM_MEMBERS;
}

export async function getAllTeamMembers(): Promise<ITeamMember[]> {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ section: 'asc' }, { displayOrder: 'asc' }],
  });
  return members.map(transformTeamMember);
}

export async function getTeamMemberById(id: string): Promise<ITeamMember | null> {
  const member = await prisma.teamMember.findUnique({ where: { id } });
  return member ? transformTeamMember(member) : null;
}

export async function createTeamMember(input: CreateTeamMemberInput): Promise<ITeamMember> {
  const member = await prisma.teamMember.create({
    data: {
      name: input.name,
      role: input.role,
      title: input.title,
      section: input.section as TeamSection,
      poleKey: input.poleKey,
      description: input.description,
      photoUrl: input.photoUrl,
      linkedin: input.socialLinks?.linkedin,
      github: input.socialLinks?.github,
      twitter: input.socialLinks?.twitter,
      displayOrder: input.displayOrder || 0,
      isActive: true,
    },
  });
  return transformTeamMember(member);
}

export async function updateTeamMember(
  id: string,
  updates: Partial<CreateTeamMemberInput> & { isActive?: boolean }
): Promise<ITeamMember | null> {
  try {
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: updates.name,
        role: updates.role,
        title: updates.title,
        section: updates.section as TeamSection | undefined,
        poleKey: updates.poleKey,
        description: updates.description,
        photoUrl: updates.photoUrl,
        linkedin: updates.socialLinks?.linkedin,
        github: updates.socialLinks?.github,
        twitter: updates.socialLinks?.twitter,
        displayOrder: updates.displayOrder,
        isActive: updates.isActive,
      },
    });
    return transformTeamMember(member);
  } catch {
    return null;
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  try {
    await prisma.teamMember.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
