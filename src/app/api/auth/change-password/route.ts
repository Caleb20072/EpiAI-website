import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * POST /api/auth/change-password
 * Change le mot de passe de l'utilisateur et retire le flag mustResetPassword
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { newPassword, currentPassword } = await req.json();

        // Validation du nouveau mot de passe
        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            );
        }

        // Vérifier la force du mot de passe
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' },
                { status: 400 }
            );
        }

        const client = await clerkClient();

        console.log('[Change Password] Starting password change for user:', userId);

        // Mettre à jour le mot de passe de l'utilisateur
        await client.users.updateUser(userId, {
            password: newPassword,
        });

        console.log('[Change Password] Password updated successfully');

        // Retirer le flag mustResetPassword des métadonnées
        const user = await client.users.getUser(userId);
        console.log('[Change Password] Current metadata before update:', user.publicMetadata);

        // Clerk ne supprime pas les propriétés avec delete, on doit mettre à false
        const publicMetadata: any = {
            ...user.publicMetadata,
            mustResetPassword: false, // Mettre à false au lieu de undefined
        };

        console.log('[Change Password] New metadata to set:', publicMetadata);

        await client.users.updateUserMetadata(userId, {
            publicMetadata,
        });

        console.log('[Change Password] Metadata updated successfully');

        // Vérifier que le flag a bien été supprimé
        const updatedUser = await client.users.getUser(userId);
        console.log('[Change Password] Final metadata after update:', updatedUser.publicMetadata);

        return NextResponse.json({
            success: true,
            message: 'Mot de passe changé avec succès',
        });
    } catch (error: any) {
        console.error('Error changing password:', error);
        console.error('Error details:', JSON.stringify({
            clerkError: error.clerkError,
            code: error.code,
            status: error.status,
            clerkTraceId: error.clerkTraceId,
            errors: error.errors,
        }, null, 2));

        // Gérer les erreurs Clerk
        if (error.errors && Array.isArray(error.errors)) {
            const errorMessage = error.errors[0]?.message || error.errors[0]?.longMessage;
            console.error('First Clerk error:', error.errors[0]);
            return NextResponse.json(
                { error: errorMessage || 'Échec du changement de mot de passe' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Échec du changement de mot de passe' },
            { status: 500 }
        );
    }
}
