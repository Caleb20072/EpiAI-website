import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getMemberAttendanceSummary,
  getAllMembersAttendanceSummary,
} from '@/lib/activities/repository';

// GET /api/attendance/report - Rapport de présence
// ?userId=xxx → rapport d'un membre spécifique (admin)
// ?all=true → rapport de tous les membres (admin)
// Sans params → rapport de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const showAll = searchParams.get('all') === 'true';

    // Rapport de tous les membres (admin only)
    if (showAll) {
      const permCheck = await checkUserPermission('attendance.manage');
      if ('error' in permCheck) {
        return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
      }

      const summaries = await getAllMembersAttendanceSummary();
      return NextResponse.json(summaries);
    }

    // Rapport d'un membre spécifique (admin only)
    if (targetUserId) {
      const permCheck = await checkUserPermission('attendance.manage');
      if ('error' in permCheck) {
        return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
      }

      const summary = await getMemberAttendanceSummary(targetUserId);
      if (!summary) {
        return NextResponse.json({ error: 'No attendance data found' }, { status: 404 });
      }
      return NextResponse.json(summary);
    }

    // Rapport personnel (utilisateur connecté)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getMemberAttendanceSummary(userId);
    return NextResponse.json(summary || {
      userId,
      userName: '',
      userEmail: '',
      totalPresent: 0,
      totalAbsent: 0,
      attendanceRate: 0,
      details: [],
    });
  } catch (error: any) {
    console.error('Error fetching attendance report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
