import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getUserByClerkId } from '@/lib/users/repository';
import {
  normalizeLinkedin,
  publicDisplayName,
  syncTeamMemberFromUser,
} from '@/lib/team/sync-from-user';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let teamMember = await prisma.teamMember.findUnique({ where: { clerkId: userId } });
  if (!teamMember) {
    const all = await prisma.teamMember.findMany();
    const { findTeamMemberForUser } = await import('@/lib/team/sync-from-user');
    teamMember = findTeamMemberForUser(all, user.firstName, user.lastName);
  }

  let linkedin = user.linkedin || teamMember?.linkedin || null;
  if (!user.linkedin && teamMember?.linkedin) {
    await prisma.user.update({
      where: { clerkId: userId },
      data: { linkedin: teamMember.linkedin },
    });
    linkedin = teamMember.linkedin;
  }

  if (teamMember && teamMember.clerkId !== userId) {
    try {
      await prisma.teamMember.update({
        where: { id: teamMember.id },
        data: { clerkId: userId },
      });
    } catch {
      /* unique clerkId already taken */
    }
  }

  const photoUrl = teamMember?.photoUrl || user.imageUrl || null;

  return NextResponse.json({
    clerkId: user.clerkId,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: publicDisplayName(user.firstName, user.lastName, user.email),
    email: user.email,
    linkedin,
    photoUrl,
    role: user.role,
    teamRole: teamMember?.role ?? null,
    poleKey: teamMember?.poleKey ?? null,
    onPublicTeam: Boolean(teamMember),
  });
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as {
    linkedin?: string;
    imageUrl?: string | null;
    syncPublicPhoto?: boolean;
  };

  const linkedin =
    body.linkedin !== undefined ? normalizeLinkedin(body.linkedin) : undefined;
  if (body.linkedin !== undefined && body.linkedin.trim() && !linkedin) {
    return NextResponse.json({ error: 'Lien LinkedIn invalide' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { clerkId: userId },
    data: {
      ...(linkedin !== undefined ? { linkedin } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
    },
  });

  await syncTeamMemberFromUser({
    clerkId: userId,
    firstName: updated.firstName,
    lastName: updated.lastName,
    imageUrl: updated.imageUrl,
    linkedin: body.linkedin !== undefined ? body.linkedin : undefined,
    syncPhoto: body.syncPublicPhoto === true,
  });

  return GET();
}
