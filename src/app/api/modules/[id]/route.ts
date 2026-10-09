import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, getModuleDetail, listGithubActivity, progressByEnrollment, saveLeadGithub } from '@/lib/modules/repository';

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
  const leadGithub = String(body.leadGithub || '').replace(/^@/, '').trim();
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(leadGithub)) {
    return NextResponse.json({ error: 'Pseudo GitHub invalide' }, { status: 400 });
  }

  const saved = await saveLeadGithub(id, leadGithub);
  return NextResponse.json(saved);
}
