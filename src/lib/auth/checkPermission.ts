import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission as checkPermission } from '@/lib/roles/utils';
import type { Permission } from '@/lib/roles/types';

/**
 * Extrait le roleId depuis les sources disponibles, dans l'ordre de priorité :
 * 1. sessionClaims.publicMetadata (JWT décodé localement — rapide, pas d'appel réseau)
 * 2. clerkClient.users.getUser() — fallback si le token ne contient pas encore le metadata
 */
async function getRoleIdForUser(userId: string, sessionClaims: Record<string, any> | null): Promise<string> {
    // Essayer depuis les claims JWT d'abord (aucun appel réseau)
    const metaFromClaims = (sessionClaims?.publicMetadata as Record<string, unknown>) || {};
    const roleFromClaims = (metaFromClaims?.role as string) || (metaFromClaims?.roleId as string);
    if (roleFromClaims) return roleFromClaims;

    // Fallback : appel Clerk API (plus lent mais garantit les données fraîches)
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return (user.publicMetadata?.role as string) || (user.publicMetadata?.roleId as string) || '';
}

/**
 * Vérifie si l'utilisateur connecté a la permission demandée côté serveur.
 * Retourne { userId, allowed } ou { error, status } si non autorisé.
 */
export async function checkUserPermission(
    required: Permission
): Promise<
    | { userId: string; allowed: true }
    | { error: string; status: 401 | 403 }
> {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return { error: 'Unauthorized', status: 401 };
    }

    const roleId = await getRoleIdForUser(userId, sessionClaims as Record<string, any>);
    const allowed = checkPermission(roleId, required);

    if (!allowed) {
        return { error: 'Forbidden: insufficient permissions', status: 403 };
    }

    return { userId, allowed: true };
}
