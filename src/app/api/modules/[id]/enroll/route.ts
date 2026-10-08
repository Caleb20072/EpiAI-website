import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, enrollByEmail, enrollStudent, getModuleDetail } from '@/lib/modules/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const module = await getModuleDetail(id);
  if (!module) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const admin = await checkUserPermission('dashboard.admin');
  const body = await request.json();
  const manager = canManageModule(module, userId, 'allowed' in admin);

  try {
    if (body.force) {
      if (!manager) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      if (!body.email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
      const result = await enrollByEmail(id, body.email, body.githubUsername);
      return NextResponse.json(result, { status: 201 });
    }

    if (!body.githubUsername) {
      return NextResponse.json({ error: 'Ton pseudo GitHub est requis' }, { status: 400 });
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const result = await enrollStudent({
      moduleId: id,
      userId,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Membre',
      userEmail: user.emailAddresses[0]?.emailAddress || '',
      githubUsername: body.githubUsername,
      forced: false,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur' },
      { status: 400 }
    );
  }
}
