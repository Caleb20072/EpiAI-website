import { prisma } from '@/lib/prisma';

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function publicDisplayName(firstName: string, lastName: string, fallback = '') {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first && !last) return fallback;
  return `${first} ${last.toUpperCase()}`.trim();
}

export function namesMatchTeam(teamName: string, firstName: string, lastName: string) {
  const team = fold(teamName);
  const full = fold(`${firstName} ${lastName}`);
  if (!team || !full) return false;
  if (team === full) return true;
  const last = fold(lastName);
  const first = fold(firstName);
  if (last && first && team.includes(last) && team.includes(first)) return true;
  return false;
}

export function findTeamMemberForUser<T extends { name: string }>(
  members: T[],
  firstName: string,
  lastName: string,
): T | null {
  const exact = members.find((row) => namesMatchTeam(row.name, firstName, lastName));
  if (exact) return exact;
  const first = fold(firstName);
  if (!first) return null;
  const firstHits = members.filter((row) => fold(row.name).split(' ')[0] === first);
  return firstHits.length === 1 ? firstHits[0] : null;
}

export function normalizeLinkedin(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;
  if (/^https?:\/\/([\w.-]+\.)?linkedin\.com\//i.test(trimmed)) return trimmed;
  if (/^linkedin\.com\//i.test(trimmed)) return `https://${trimmed}`;
  const slug = trimmed.replace(/^\/?(in\/)?/i, '').replace(/^\/+|\/+$/g, '');
  if (!slug || /\s/.test(slug)) return null;
  return `https://www.linkedin.com/in/${slug}`;
}

export async function syncTeamMemberFromUser(input: {
  clerkId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  linkedin?: string | null;
  syncPhoto?: boolean;
}) {
  let member = await prisma.teamMember.findUnique({ where: { clerkId: input.clerkId } });
  if (!member) {
    const candidates = await prisma.teamMember.findMany();
    member = findTeamMemberForUser(candidates, input.firstName, input.lastName);
  }

  if (!member) return null;

  const data: {
    clerkId: string;
    photoUrl?: string;
    linkedin?: string | null;
  } = { clerkId: input.clerkId };

  if (input.syncPhoto) {
    const imageUrl = input.imageUrl?.trim() || null;
    if (imageUrl) data.photoUrl = imageUrl;
  }
  if (typeof input.linkedin === 'string') {
    data.linkedin = normalizeLinkedin(input.linkedin);
  }

  return prisma.teamMember.update({
    where: { id: member.id },
    data,
  });
}
