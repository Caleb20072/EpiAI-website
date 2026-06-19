import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getMemberStats } from '@/lib/users/repository';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = user.publicMetadata?.role as string | undefined;
        const adminRoles = ['president', 'admin_general', 'chef_pole'];
        if (!role || !adminRoles.includes(role)) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const clerkUsers = await client.users.getUserList({ limit: 500 });
        const memberStats = await getMemberStats();

        const adminUsers = clerkUsers.data.filter((u) => {
            const userRole = u.publicMetadata?.role as string | undefined;
            return userRole && adminRoles.includes(userRole);
        });

        return NextResponse.json({
            totalUsers: clerkUsers.totalCount,
            totalMembers: memberStats.total,
            approvedMembers: memberStats.active,
            pendingMembers: memberStats.pending,
            adminCount: adminUsers.length,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch stats';
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
