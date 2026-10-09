import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, getStudentFollowUp } from '@/lib/modules/repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, userId: studentId } = await params;
  const followUp = await getStudentFollowUp(id, studentId);
  if (!followUp) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const admin = await checkUserPermission('dashboard.admin');
  if (!canManageModule({ leadUserId: followUp.leadUserId }, userId, 'allowed' in admin)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  return NextResponse.json(followUp);
}
