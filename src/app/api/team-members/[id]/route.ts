import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from '@/lib/team/repository';

// GET /api/team-members/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await getTeamMemberById(id);

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT /api/team-members/[id] - Modifier un membre (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('team.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const body = await request.json();
    const member = await updateTeamMember(id, body);

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/team-members/[id] - Supprimer un membre (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permCheck = await checkUserPermission('team.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const success = await deleteTeamMember(id);

    if (!success) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
