import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * GET /api/auth/check-password-reset
 * Vérifie si l'utilisateur doit réinitialiser son mot de passe
 */
export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Essayer d'abord via les claims de session (plus rapide, pas d'appel API Clerk)
        const metaFromSession = (sessionClaims?.publicMetadata as Record<string, unknown>) || {};
        if ('mustResetPassword' in metaFromSession) {
            const mustResetPassword = metaFromSession.mustResetPassword === true;
            return NextResponse.json({ mustResetPassword });
        }

        // Fallback : appel Clerk API
        try {
            const client = await clerkClient();
            const user = await client.users.getUser(userId);
            const mustResetPassword = user.publicMetadata?.mustResetPassword === true;
            console.log('[Check Password Reset] Must reset:', mustResetPassword);
            return NextResponse.json({ mustResetPassword });
        } catch (clerkErr: any) {
            console.warn('[Check Password Reset] Clerk API unavailable, defaulting to false:', clerkErr.message);
            return NextResponse.json({ mustResetPassword: false });
        }
    } catch (error: any) {
        console.error('Error checking password reset status:', error);
        // Retourne false au lieu de 500 pour ne pas bloquer l'accès
        return NextResponse.json({ mustResetPassword: false });
    }
}
