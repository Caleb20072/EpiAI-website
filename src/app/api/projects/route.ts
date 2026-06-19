import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { resolveRoleSlug } from '@/lib/roles/utils';
import { getProjects, createProject } from '@/lib/projects/repository';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showAll = searchParams.get('all') === 'true';

        if (showAll) {
            const { userId, sessionClaims } = await auth();
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const claims = sessionClaims as Record<string, unknown> | null;
            const meta = (claims?.publicMetadata as Record<string, unknown>) || {};
            const roleSlug = resolveRoleSlug(meta);
            const { hasPermission } = await import('@/lib/roles/utils');
            if (!hasPermission(roleSlug, 'content.create') && !hasPermission(roleSlug, 'dashboard.admin')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const projects = await getProjects(!showAll);
        return NextResponse.json(projects);
    } catch (error) {
        console.error('[API] Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const claims = sessionClaims as Record<string, unknown> | null;
        const roleId = (claims?.publicMetadata as Record<string, unknown>)?.role as string || '';
        const { hasPermission } = await import('@/lib/roles/utils');
        if (!hasPermission(roleId, 'content.create')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();
        const project = await createProject({ ...body, createdBy: userId });
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
