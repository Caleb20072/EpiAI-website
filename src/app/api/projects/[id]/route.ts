import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid project ID' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const projectsCollection = db.collection('projects');

        const project = await projectsCollection.findOne({ _id: new ObjectId(id) });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(project);

    } catch (error) {
        console.error('[API] Error fetching project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const roleId = user.publicMetadata?.roleId as string;

        // Check if user has permission to edit content
        const { hasPermission } = await import('@/lib/roles/utils');
        if (!hasPermission(roleId, 'content.edit.all')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid project ID' },
                { status: 400 }
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
            published,
        } = body;

        const db = await connectDB();
        const projectsCollection = db.collection('projects');

        const result = await projectsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title,
                    description,
                    imageUrl,
                    status,
                    techStack,
                    githubUrl,
                    discoveryUrl,
                    published,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[API] Error updating project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            { status: 401 }
            );
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const roleId = user.publicMetadata?.roleId as string;

        // Check if user has permission to delete/manage content
        const { hasPermission } = await import('@/lib/roles/utils');
        if (!hasPermission(roleId, 'content.edit.all')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid project ID' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const projectsCollection = db.collection('projects');

        const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[API] Error deleting project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
