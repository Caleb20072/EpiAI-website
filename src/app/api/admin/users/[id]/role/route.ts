import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission, getRoleLevel, isValidRole } from '@/lib/roles/utils';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { roleId: newRoleId } = await request.json();

        if (!newRoleId || !isValidRole(newRoleId)) {
            return NextResponse.json(
                { error: 'Invalid role ID' },
                { status: 400 }
            );
        }

        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        const currentRoleId = (currentUser.publicMetadata?.role as string) || (currentUser.publicMetadata?.roleId as unknown as string);
        const currentLevel = getRoleLevel(currentRoleId);

        // Check permission
        if (!hasPermission(currentRoleId, 'admin.roles.assign')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const { id: targetUserId } = await context.params;

        // Prevent editing self role (anti-lockout / anti-escalation)
        if (targetUserId === userId) {
            return NextResponse.json(
                { error: 'Cannot change your own role' },
                { status: 400 }
            );
        }

        const targetUser = await client.users.getUser(targetUserId);
        const targetRoleId = targetUser.publicMetadata?.roleId as string; // This might be number or string in metadata
        // Clerk metadata can be weird. In definitions.ts, levels are numbers. roleId strings.
        // Let's rely on getRoleLevel helper which handles strings.

        // In invite route, we saw `roleId: 9` (number) but also `role: "president"`.
        // Let's try to resolve the level safely.
        // The `getRoleLevel` helper takes a STRING role ID (e.g. 'president').
        // If metadata stores numeric ID (old legacy?) or string ID?
        // From `roles-constants.ts`, IDs are strings 'president'.
        // Safe assumption: we are moving to string IDs.

        // Check hierarchy: Cannot edit someone higher/equal
        // We need to know the target's current level.
        // If target has roleId stored as "president", level is 9.
        const targetCurrentRoleStr = (targetUser.publicMetadata?.role as string) || (targetUser.publicMetadata?.roleId as unknown as string);
        // Note: invite route saved `roleId: 9` AND `role: 'president'`.
        // Safest is to map from the 'role' string if available.

        // Simplification: Let's assume `role` metadata holds the string ID.
        const targetLevel = getRoleLevel(targetCurrentRoleStr);

        if (targetLevel >= currentLevel) {
            return NextResponse.json(
                { error: 'Cannot modify a user with equal or higher rank' },
                { status: 403 }
            );
        }

        // Check hierarchy: Cannot promote to higher/equal than self
        const newRoleLevel = getRoleLevel(newRoleId);
        if (newRoleLevel >= currentLevel) {
            return NextResponse.json(
                { error: 'Cannot promote user to a rank equal or higher than your own' },
                { status: 403 }
            );
        }

        // Update Clerk Metadata
        await client.users.updateUser(targetUserId, {
            publicMetadata: {
                ...targetUser.publicMetadata,
                role: newRoleId,
                // Keep roleId as number for legacy compatibility if needed, or update it?
                // `definitions.ts` has `level`.
                roleId: newRoleLevel, // Keeping it consistent with invite route which seemed to save number to roleId?
                // Actually invite route: roleId: 9 (number), role: 'president'.
                // So roleId = level.
            }
        });

        return NextResponse.json({ success: true, role: newRoleId });

    } catch (error: any) {
        console.error('[API] Error updating user role:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
