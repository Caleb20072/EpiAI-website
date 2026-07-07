import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission as checkPermission, resolveRoleSlug } from '@/lib/roles/utils';
import type { Permission } from '@/lib/roles/types';

/**
 * Extrait le slug de rôle depuis les sources disponibles, dans l'ordre de priorité :
 * 1. sessionClaims.publicMetadata (JWT décodé localement — rapide, pas d'appel réseau)
 * 2. clerkClient.users.getUser() — fallback si le token ne contient pas encore le metadata
 */
export async function getSessionRoleSlug(
    userId: string,
    sessionClaims: Record<string, unknown> | null
): Promise<string> {
    const metaFromClaims = (sessionClaims?.publicMetadata as Record<string, unknown>) || {};
    const roleFromClaims = resolveRoleSlug(metaFromClaims);
    if (roleFromClaims) return roleFromClaims;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return resolveRoleSlug(user.publicMetadata as Record<string, unknown>);
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

    const roleId = await getSessionRoleSlug(userId, sessionClaims as Record<string, unknown> | null);
    const allowed = checkPermission(roleId, required);

    if (!allowed) {
        return { error: 'Forbidden: insufficient permissions', status: 403 };
    }

    return { userId, allowed: true };
}
