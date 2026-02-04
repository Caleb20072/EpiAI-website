import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/auth/session
 * Récupère les informations de session enrichies avec publicMetadata
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

        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        return NextResponse.json({
            userId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            publicMetadata: user.publicMetadata,
        });
    } catch (error: any) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch session' },
            { status: 500 }
        );
    }
}
