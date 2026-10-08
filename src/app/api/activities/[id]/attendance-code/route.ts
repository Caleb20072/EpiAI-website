import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { rotateAttendanceCode } from '@/lib/modules/repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await checkUserPermission('attendance.manage');
  const fallback = 'error' in admin ? await checkUserPermission('dashboard.admin') : admin;
  if (!('allowed' in fallback)) {
    return NextResponse.json({ error: fallback.error }, { status: fallback.status });
  }
  const { id } = await params;
  try {
    const session = await rotateAttendanceCode(id);
    return NextResponse.json({
      code: session.code,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur' },
      { status: 404 }
    );
  }
}
