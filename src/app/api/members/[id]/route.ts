import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// TODO: Uncomment when MongoDB is installed
// import { connectDB } from '@/lib/db/mongodb';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId: currentUserId } = await auth();

        if (!currentUserId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        // Only allow users to access their own data (or admins can access any)
        if (id !== currentUserId) {
            // TODO: Add admin check here if needed
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // TODO: Enable MongoDB when installed
        // const db = await connectDB();
        // const membersCollection = db.collection('members');
        // const member = await membersCollection.findOne({ clerkId: id });

        // Temporary: Return placeholder data until MongoDB is connected
        return NextResponse.json({
            pole: null,
            team: null,
            clerkId: id,
            joinedAt: new Date().toISOString(),
        });

    } catch (error) {
        console.error('[API] Error fetching member:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
