import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, getModuleDetail, listGithubActivity } from '@/lib/modules/repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const module = await getModuleDetail(id);
  if (!module) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const admin = await checkUserPermission('dashboard.admin');
  const isAdmin = 'allowed' in admin;
  const mine = module.enrollments.find((e) => e.userId === userId);
  const activity = await listGithubActivity(id);

  return NextResponse.json({
    ...module,
    canManage: canManageModule(module, userId, isAdmin),
    enrolled: Boolean(mine),
    myLevel: mine?.level ?? 0,
    githubActivity: activity,
  });
}
