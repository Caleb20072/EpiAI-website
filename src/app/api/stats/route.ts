import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch real member count from Clerk
        const client = await clerkClient();
        const users = await client.users.getUserList({ limit: 500 });
        const memberCount = users.totalCount;

        // TODO: Fetch from MongoDB when installed
        // For now, return 0 for discussions, events, resources
        const stats = {
            members: memberCount,
            discussions: 0, // TODO: Query discussions collection
            events: 0,      // TODO: Query events collection
            resources: 0,   // TODO: Query resources collection
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('[API] Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
