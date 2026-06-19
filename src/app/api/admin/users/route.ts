import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { normalizeRoleSlug } from '@/lib/roles/utils';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        const role = currentUser.publicMetadata?.role as string | undefined;
        const adminRoles = ['president', 'admin_general', 'chef_pole'];
        if (!role || !adminRoles.includes(role)) {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const clerkUsers = await client.users.getUserList({ limit: 500 });
        const dbUsers = await prisma.user.findMany();
        const userMap = new Map(dbUsers.map((u) => [u.clerkId, u]));

        const users = clerkUsers.data.map((user) => {
            const dbUser = userMap.get(user.id);
            const userRole = normalizeRoleSlug(user.publicMetadata?.role as string | undefined)
              || (user.publicMetadata?.role as string | undefined)
              || 'membre';
            return {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
                role: userRole || 'membre',
                status: dbUser?.memberStatus || 'active',
                createdAt: user.createdAt,
                lastSignInAt: user.lastSignInAt,
                imageUrl: user.imageUrl,
            };
        });

        users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            users,
            total: users.length,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch users';
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
