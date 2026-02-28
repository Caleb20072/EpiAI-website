import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission as checkPermission } from '@/lib/roles/utils';
import type { Permission } from '@/lib/roles/types';

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
    const { userId } = await auth();

    if (!userId) {
        return { error: 'Unauthorized', status: 401 };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const roleId = (user.publicMetadata?.role as string) || (user.publicMetadata?.roleId as string) || '';

    const allowed = checkPermission(roleId, required);

    if (!allowed) {
        return { error: 'Forbidden: insufficient permissions', status: 403 };
    }

    return { userId, allowed: true };
}
