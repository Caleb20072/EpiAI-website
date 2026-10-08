import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { submitProject } from '@/lib/modules/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { projectId } = await params;
  const body = await request.json().catch(() => ({}));
  try {
    const result = await submitProject({
      projectId,
      userId,
      notes: body.notes || '',
      fileUrl: body.fileUrl,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur' },
      { status: 400 }
    );
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { projectId } = await params;
  const { provisionGithubRepos, getModuleDetail } = await import('@/lib/modules/repository');
  const { prisma } = await import('@/lib/prisma');
  const project = await prisma.moduleProject.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const module = await getModuleDetail(project.moduleId);
  if (!module) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const { checkUserPermission } = await import('@/lib/auth/checkPermission');
  const { canManageModule } = await import('@/lib/modules/repository');
  const admin = await checkUserPermission('dashboard.admin');
  if (!canManageModule(module, userId, 'allowed' in admin)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  try {
    const created = await provisionGithubRepos(projectId);
    return NextResponse.json({ created });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur GitHub' },
      { status: 400 }
    );
  }
}
