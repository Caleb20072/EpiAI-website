import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongodb';

export async function GET(request: NextRequest) {
    try {
        const db = await connectDB();
        const projectsCollection = db.collection('projects');

        // Check if admin wants to see all projects (published + drafts)
        const searchParams = request.nextUrl.searchParams;
        const showAll = searchParams.get('all') === 'true';

        // Fetch projects based on query parameter
        const query = showAll ? {} : { published: true };
        const projects = await projectsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(projects);

    } catch (error) {
        console.error('[API] Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Lire le rôle depuis les JWT claims (instantané, pas d'appel Clerk API)
        const claims = (await auth()).sessionClaims as Record<string, unknown> | null;
        const roleId = (claims?.publicMetadata as Record<string, unknown>)?.role as string || '';

        // Check if user has permission to create content
        const { hasPermission } = await import('@/lib/roles/utils');
        if (!hasPermission(roleId, 'content.create')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            imageUrl,
            status,
            techStack,
            githubUrl,
            discoveryUrl,
            published = false,
        } = body;

        const db = await connectDB();
        const projectsCollection = db.collection('projects');

        const newProject = {
            title,
            description,
            imageUrl,
            status,
            techStack,
            githubUrl,
            discoveryUrl,
            published,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await projectsCollection.insertOne(newProject);

        return NextResponse.json({
            _id: result.insertedId,
            ...newProject,
        }, { status: 201 });

    } catch (error) {
        console.error('[API] Error creating project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
