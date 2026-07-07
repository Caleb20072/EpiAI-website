import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSessionRoleSlug } from '@/lib/auth/checkPermission';
import { hasPermission } from '@/lib/roles/utils';
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

            const roleSlug = await getSessionRoleSlug(userId, sessionClaims as Record<string, unknown> | null);
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
        const { checkUserPermission } = await import('@/lib/auth/checkPermission');
        const perm = await checkUserPermission('content.create');
        if ('error' in perm) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }

        const body = await request.json();
        const project = await createProject({ ...body, createdBy: perm.userId });
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
