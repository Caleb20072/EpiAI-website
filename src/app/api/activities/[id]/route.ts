import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getActivityById,
  updateActivity,
  deleteActivity,
  getActivityRegistrations,
} from '@/lib/activities/repository';

// GET /api/activities/[id] - Détail d'une activité
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const includeRegistrations = searchParams.get('registrations') === 'true';

    const activity = await getActivityById(id, userId || undefined);

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    if (includeRegistrations) {
      // Vérifier permission admin pour voir les inscriptions
      const permCheck = await checkUserPermission('activities.manage');
      if ('error' in permCheck) {
        return NextResponse.json(activity);
      }
      const registrations = await getActivityRegistrations(id);

      // Enrich with fresh Clerk data — fixes old bad records stored in MongoDB
      if (registrations.length > 0) {
        try {
          const client = await clerkClient();
          const userIds = registrations.map((r) => r.userId);
          const { data: clerkUsers } = await client.users.getUserList({ userId: userIds, limit: 100 });
          const clerkMap = new Map(clerkUsers.map((u) => [u.id, u]));

          const enriched = registrations.map((reg) => {
            const u = clerkMap.get(reg.userId);
            if (!u) return reg;
            return {
              ...reg,
              userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || reg.userName,
              userEmail: u.emailAddresses[0]?.emailAddress || reg.userEmail,
            };
          });

          return NextResponse.json({ ...activity, registrations: enriched });
        } catch (clerkErr) {
          console.warn('[activities/[id]] Clerk enrichment failed, using stored data:', clerkErr);
        }
      }

      return NextResponse.json({ ...activity, registrations });
    }

    return NextResponse.json(activity);
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// PATCH /api/activities/[id] - Modifier une activité (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('activities.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const body = await request.json();
    const activity = await updateActivity(id, body);

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error: any) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id] - Supprimer une activité (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('activities.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const success = await deleteActivity(id);

    if (!success) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
