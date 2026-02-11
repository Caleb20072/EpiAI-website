import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db/mongodb';

interface Member {
    userId: string;
    status: string;
    [key: string]: any;
}

/**
 * GET /api/admin/users
 * Récupère la liste complète des utilisateurs avec leurs rôles et statuts
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
        const currentUser = await client.users.getUser(userId);
        const role = currentUser.publicMetadata?.role as string | undefined;

        const adminRoles = ['president', 'admin_general', 'chef_pole'];
        if (!role || !adminRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // Récupérer tous les utilisateurs Clerk
        const clerkUsers = await client.users.getUserList({ limit: 500 });

        // Connexion MongoDB pour les infos de membership
        const db = await connectDB();
        const membersCollection = db.collection<Member>('members');

        // Créer un map des membres par userId
        const members = await membersCollection.find({}).toArray();
        const memberMap = new Map(
            members.map((member: Member) => [member.userId, member])
        );

        // Fusionner les données
        const users = clerkUsers.data.map(user => {
            const member = memberMap.get(user.id);
            const userRole = user.publicMetadata?.role as string | undefined;

            return {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
                role: userRole || 'membre',
                status: member?.status || 'active',
                createdAt: user.createdAt,
                lastSignInAt: user.lastSignInAt,
                imageUrl: user.imageUrl,
            };
        });

        // Trier par date de création (plus récent en premier)
        users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            users,
            total: users.length,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
