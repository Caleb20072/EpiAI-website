import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/auth/check-password-reset
 * Vérifie si l'utilisateur doit réinitialiser son mot de passe
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

        // Vérifier les métadonnées publiques - doit être explicitement true
        const mustResetPassword = user.publicMetadata?.mustResetPassword === true;
        console.log('[Check Password Reset] User metadata:', user.publicMetadata);
        console.log('[Check Password Reset] Must reset:', mustResetPassword);

        return NextResponse.json({
            mustResetPassword,
        });
    } catch (error: any) {
        console.error('Error checking password reset status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check password reset status' },
            { status: 500 }
        );
    }
}
