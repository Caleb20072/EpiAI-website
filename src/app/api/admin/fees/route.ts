import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { listDues, markDuePaid } from '@/lib/modules/repository';

export async function GET() {
  const admin = await checkUserPermission('dashboard.admin');
  if (!('allowed' in admin)) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  const dues = await listDues();
  return NextResponse.json(dues);
}

export async function POST(request: NextRequest) {
  const admin = await checkUserPermission('dashboard.admin');
  if (!('allowed' in admin)) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const due = await markDuePaid(id);
  return NextResponse.json(due);
}
