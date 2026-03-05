import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/auth/session
 * Récupère les informations de session enrichies avec publicMetadata.
 * Utilise les sessionClaims (JWT local) en priorité pour éviter les appels Clerk API.
 */
export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Lire le publicMetadata depuis les claims JWT (pas d'appel réseau)
        const metaFromClaims = (sessionClaims?.publicMetadata as Record<string, unknown>) || {};

        // Si les claims ont des données (cas nominal), répondre immédiatement
        if (Object.keys(metaFromClaims).length > 0) {
            return NextResponse.json({
                userId,
                firstName: (sessionClaims?.firstName as string) || null,
                lastName: (sessionClaims?.lastName as string) || null,
                email: (sessionClaims?.email as string) || null,
                publicMetadata: metaFromClaims,
            });
        }

        // Fallback : appel Clerk API si le token ne contient pas encore le metadata
        // (ex: premier login avant que le token soit rafraîchi)
        try {
            const client = await clerkClient();
            const user = await client.users.getUser(userId);
            return NextResponse.json({
                userId: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                publicMetadata: user.publicMetadata,
            });
        } catch (clerkErr: any) {
            // Si Clerk API est indisponible, retourner les données du token JWT au minimum
            console.warn('[session] Clerk API unavailable, using session claims:', clerkErr.message);
            return NextResponse.json({
                userId,
                firstName: null,
                lastName: null,
                email: null,
                publicMetadata: metaFromClaims,
            });
        }
    } catch (error: any) {
        console.error('Error fetching session:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch session' },
            { status: 500 }
        );
    }
}

