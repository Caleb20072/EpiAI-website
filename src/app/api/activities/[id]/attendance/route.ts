import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  markAttendance,
  bulkMarkAttendance,
  getActivityAttendance,
} from '@/lib/activities/repository';
import type { MarkAttendanceInput } from '@/lib/activities/types';

// GET /api/activities/[id]/attendance - Obtenir le rapport de présence
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('attendance.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const report = await getActivityAttendance(id);

    // Enrich stored records with fresh Clerk data — fixes both new & existing bad records
    const allEntries = [...report.presentList, ...report.absentList];
    const userIds = [...new Set(allEntries.map((e) => e.userId))];

    if (userIds.length > 0) {
      try {
        const client = await clerkClient();
        const { data: clerkUsers } = await client.users.getUserList({ userId: userIds, limit: 100 });
        const clerkMap = new Map(clerkUsers.map((u) => [u.id, u]));

        const enrichEntry = (entry: any) => {
          const u = clerkMap.get(entry.userId);
          if (!u) return entry;
          return {
            ...entry,
            userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || entry.userName,
            userEmail: u.emailAddresses[0]?.emailAddress || entry.userEmail,
          };
        };

        report.presentList = report.presentList.map(enrichEntry);
        report.absentList = report.absentList.map(enrichEntry);
      } catch (clerkErr) {
        // If Clerk is unreachable, fall back to stored data — don't break the page
        console.warn('[attendance GET] Clerk enrichment failed, using stored data:', clerkErr);
      }
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/activities/[id]/attendance - Marquer présent/absent (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Seuls admin et admin_general peuvent marquer la présence
    const permCheck = await checkUserPermission('attendance.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const body = await request.json();

    // Récupérer le nom de l'admin
    const client = await clerkClient();
    const adminUser = await client.users.getUser(permCheck.userId);
    const adminName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin';

    // Bulk mode ou single mode
    if (Array.isArray(body.attendances)) {
      const result = await bulkMarkAttendance(
        id,
        body.attendances as MarkAttendanceInput[],
        permCheck.userId,
        adminName
      );
      return NextResponse.json(result);
    }

    // Single attendance
    const { userId, userName, userEmail, isPresent, notes } = body;
    if (!userId || !userName || !userEmail || isPresent === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, userEmail, isPresent' },
        { status: 400 }
      );
    }

    const result = await markAttendance(
      id,
      { userId, userName, userEmail, isPresent, notes },
      permCheck.userId,
      adminName
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
