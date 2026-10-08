import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, createModuleProject, getModuleDetail, provisionReposForStudent } from '@/lib/modules/repository';
import { createActivity } from '@/lib/activities/repository';
import { prisma } from '@/lib/prisma';

async function assertManager(id: string, userId: string) {
  const module = await getModuleDetail(id);
  if (!module) return { error: 'Introuvable', status: 404 as const };
  const admin = await checkUserPermission('dashboard.admin');
  if (!canManageModule(module, userId, 'allowed' in admin)) {
    return { error: 'Accès refusé', status: 403 as const };
  }
  return { module };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const gate = await assertManager(id, userId);
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await request.json();
  if (!body.title || !body.startsAt) {
    return NextResponse.json({ error: 'Titre et date de début requis' }, { status: 400 });
  }

  const project = await createModuleProject({
    moduleId: id,
    title: body.title,
    description: body.description || '',
    pdfUrl: body.pdfUrl,
    startsAt: body.startsAt,
    createdBy: userId,
  });
  for (const enrollment of gate.module.enrollments) {
    await provisionReposForStudent(id, enrollment.userId).catch(() => undefined);
  }
  return NextResponse.json(project, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const gate = await assertManager(id, userId);
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await request.json();
  if (!body.title || !body.date || !body.location) {
    return NextResponse.json({ error: 'Titre, date et lieu requis' }, { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Lead';
  const activity = await createActivity(
    {
      title: body.title,
      description: body.description || gate.module.name,
      date: body.date,
      location: body.location,
      isOnline: Boolean(body.isOnline),
      isMandatory: body.isMandatory ?? true,
    },
    userId,
    name
  );
  await prisma.activity.update({
    where: { id: activity.id },
    data: { moduleId: id },
  });
  return NextResponse.json(activity, { status: 201 });
}
