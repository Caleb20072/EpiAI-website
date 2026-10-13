import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, deleteModule, getModuleDetail, listGithubActivity, progressByEnrollment, saveLeadGithub, setSecondLead, updateModule } from '@/lib/modules/repository';

async function leadDisplayName(userId: string, fallback: string) {
  const client = await clerkClient();
  const person = await client.users.getUser(userId).catch(() => null);
  if (!person) return fallback || userId;
  return `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.emailAddresses[0]?.emailAddress || fallback || userId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const learningModule = await getModuleDetail(id);
  if (!learningModule) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const admin = await checkUserPermission('dashboard.admin');
  const isAdmin = 'allowed' in admin;
  const mine = learningModule.enrollments.find((enrollment) => enrollment.userId === userId);
  const [activity, progress] = await Promise.all([
    listGithubActivity(id),
    progressByEnrollment(id),
  ]);

  return NextResponse.json({
    ...learningModule,
    enrollments: learningModule.enrollments.map((enrollment) => ({
      ...enrollment,
      todayCount: progress[enrollment.userId]?.todayCount ?? 0,
      lastPushAt: progress[enrollment.userId]?.lastPushAt ?? null,
      lastMessage: progress[enrollment.userId]?.lastMessage ?? null,
    })),
    canManage: canManageModule(learningModule, userId, isAdmin),
    enrolled: Boolean(mine),
    myLevel: mine?.level ?? 0,
    githubActivity: activity,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const learningModule = await getModuleDetail(id);
  if (!learningModule) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const admin = await checkUserPermission('dashboard.admin');
  if (!canManageModule(learningModule, userId, 'allowed' in admin)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  if (typeof body.name === 'string') {
    if (!('allowed' in admin)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    const name = body.name.trim();
    const leadUserId = String(body.leadUserId || '').trim();
    if (!name || !leadUserId) {
      return NextResponse.json({ error: 'Nom et lead requis' }, { status: 400 });
    }
    const secondId = String(body.lead2UserId || '').trim();
    if (secondId && secondId === leadUserId) {
      return NextResponse.json({ error: 'Les deux leads doivent être deux personnes différentes' }, { status: 400 });
    }
    try {
      const updated = await updateModule(id, {
        name,
        description: String(body.description || ''),
        leadUserId,
        leadName: await leadDisplayName(leadUserId, body.leadName || ''),
        lead2UserId: secondId || null,
        lead2Name: secondId ? await leadDisplayName(secondId, body.lead2Name || '') : null,
      });
      return NextResponse.json(updated);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erreur' },
        { status: 400 }
      );
    }
  }

  if ('lead2UserId' in body) {
    const secondId = String(body.lead2UserId || '').trim();
    try {
      if (!secondId) {
        await setSecondLead(id, null);
        return NextResponse.json({ ok: true, lead2UserId: null, lead2Name: null });
      }
      const client = await clerkClient();
      const person = await client.users.getUser(secondId).catch(() => null);
      const name = person
        ? `${person.firstName || ''} ${person.lastName || ''}`.trim() || person.emailAddresses[0]?.emailAddress || body.lead2Name || secondId
        : body.lead2Name || secondId;
      await setSecondLead(id, { userId: secondId, name });
      return NextResponse.json({ ok: true, lead2UserId: secondId, lead2Name: name });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erreur' },
        { status: 400 }
      );
    }
  }

  const leadGithub = String(body.leadGithub || '').replace(/^@/, '').trim();
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(leadGithub)) {
    return NextResponse.json({ error: 'Pseudo GitHub invalide' }, { status: 400 });
  }
  const slot = body.slot === 2 ? 2 : 1;
  const owner = slot === 2 ? learningModule.lead2UserId : learningModule.leadUserId;
  if (!owner) return NextResponse.json({ error: 'Ce lead n’existe pas' }, { status: 400 });
  if (!('allowed' in admin) && owner !== userId) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const saved = await saveLeadGithub(id, leadGithub, slot);
  return NextResponse.json(saved);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = await checkUserPermission('dashboard.admin');
  if (!('allowed' in admin)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  const { id } = await params;
  const learningModule = await getModuleDetail(id);
  if (!learningModule) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  await deleteModule(id);
  return NextResponse.json({ ok: true });
}
