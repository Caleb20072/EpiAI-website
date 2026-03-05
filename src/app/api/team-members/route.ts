import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import {
  getActiveTeamMembers,
  getAllTeamMembers,
  createTeamMember,
} from '@/lib/team/repository';
import type { CreateTeamMemberInput } from '@/lib/team/types';

// GET /api/team-members - Récupérer les membres de l'équipe
// ?all=true → tous les membres (admin) / sinon → actifs uniquement (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    if (showAll) {
      // Admin: voir tous les membres (actifs et inactifs)
      const permCheck = await checkUserPermission('team.manage');
      if ('error' in permCheck) {
        // Si pas admin, retourner uniquement les actifs
        const members = await getActiveTeamMembers();
        return NextResponse.json(members);
      }
      const members = await getAllTeamMembers();
      return NextResponse.json(members);
    }

    // Public: uniquement les membres actifs
    const members = await getActiveTeamMembers();
    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/team-members - Ajouter un membre (admin only)
export async function POST(request: NextRequest) {
  try {
    const permCheck = await checkUserPermission('team.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const body: CreateTeamMemberInput = await request.json();

    if (!body.name || !body.role || !body.section) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, section' },
        { status: 400 }
      );
    }

    const member = await createTeamMember(body);
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team member' },
      { status: 500 }
    );
  }
}
