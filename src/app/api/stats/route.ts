import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getRecentActivity } from '@/lib/users/repository';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clerkClient();
        const users = await client.users.getUserList({ limit: 500 });

        const [discussions, events, resources, recentActivity] = await Promise.all([
            prisma.thread.count(),
            prisma.event.count({ where: { isPublished: true } }),
            prisma.resource.count({ where: { isPublished: true } }),
            getRecentActivity(8),
        ]);

        return NextResponse.json({
            members: users.totalCount,
            discussions,
            events,
            resources,
            recentActivity,
        });
    } catch (error) {
        console.error('[API] Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
