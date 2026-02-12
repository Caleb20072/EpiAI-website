import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongodb';

/**
 * GET /api/admin/stats
 * Récupère les statistiques du dashboard admin en temps réel
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Vérifier les permissions admin
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = user.publicMetadata?.role as string | undefined;

        const adminRoles = ['president', 'admin_general', 'chef_pole'];
        if (!role || !adminRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // Connexion MongoDB
        const db = await connectDB();

        // Statistiques de la collection Members
        const membersCollection = db.collection('members');
        const totalMembers = await membersCollection.countDocuments();
        const approvedMembers = await membersCollection.countDocuments({ status: 'approved' });
        const pendingMembers = await membersCollection.countDocuments({ status: 'pending' });

        // Statistiques des utilisateurs Clerk
        const clerkUsers = await client.users.getUserList({ limit: 500 });
        const totalUsers = clerkUsers.totalCount;

        // Compter les admins (users avec role admin dans publicMetadata)
        const adminUsers = clerkUsers.data.filter(user => {
            const userRole = user.publicMetadata?.role as string | undefined;
            return userRole && adminRoles.includes(userRole);
        });

        return NextResponse.json({
            totalUsers,
            totalMembers,
            approvedMembers,
            pendingMembers,
            adminCount: adminUsers.length,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
