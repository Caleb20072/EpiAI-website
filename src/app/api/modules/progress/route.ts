import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { listFollowedStudents } from '@/lib/modules/repository';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = await checkUserPermission('dashboard.admin');
  const data = await listFollowedStudents(userId, 'allowed' in admin);
  if (data.scope === 'none') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  return NextResponse.json(data);
}
