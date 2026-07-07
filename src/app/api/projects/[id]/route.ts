import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSessionRoleSlug, checkUserPermission } from '@/lib/auth/checkPermission';
import { hasPermission } from '@/lib/roles/utils';
import { getProjectById, updateProject, deleteProject } from '@/lib/projects/repository';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const project = await getProjectById(id);

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (!project.published) {
            const { userId, sessionClaims } = await auth();
            if (!userId) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            const roleSlug = await getSessionRoleSlug(userId, sessionClaims as Record<string, unknown> | null);
            if (!hasPermission(roleSlug, 'content.create') && !hasPermission(roleSlug, 'dashboard.admin')) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('[API] Error fetching project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const perm = await checkUserPermission('content.edit.all');
        if ('error' in perm) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }

        const { id } = await context.params;
        const body = await request.json();
        const project = await updateProject(id, body);

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error updating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const perm = await checkUserPermission('content.edit.all');
        if ('error' in perm) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }

        const { id } = await context.params;
        const ok = await deleteProject(id);

        if (!ok) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error deleting project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
