import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission, getRoleLevel, isValidRole, resolveRoleSlug } from '@/lib/roles/utils';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roleId: newRoleId } = await request.json();

        if (!newRoleId || !isValidRole(newRoleId)) {
            return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
        }

        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        const currentRoleSlug = resolveRoleSlug(currentUser.publicMetadata as Record<string, unknown>);
        const currentLevel = getRoleLevel(currentRoleSlug);

        if (!hasPermission(currentRoleSlug, 'admin.roles.assign')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { id: targetUserId } = await context.params;

        if (targetUserId === userId) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        const targetUser = await client.users.getUser(targetUserId);
        const targetRoleSlug = resolveRoleSlug(targetUser.publicMetadata as Record<string, unknown>);
        const targetLevel = getRoleLevel(targetRoleSlug);

        if (targetLevel >= currentLevel) {
            return NextResponse.json(
                { error: 'Cannot modify a user with equal or higher rank' },
                { status: 403 }
            );
        }

        const newRoleLevel = getRoleLevel(newRoleId);
        if (newRoleLevel >= currentLevel) {
            return NextResponse.json(
                { error: 'Cannot promote user to a rank equal or higher than your own' },
                { status: 403 }
            );
        }

        await client.users.updateUser(targetUserId, {
            publicMetadata: {
                ...targetUser.publicMetadata,
                role: newRoleId,
                roleId: newRoleLevel,
            },
        });

        await prisma.user.updateMany({
            where: { clerkId: targetUserId },
            data: { role: newRoleId, roleLevel: newRoleLevel },
        });

        return NextResponse.json({ success: true, role: newRoleId });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('[API] Error updating user role:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
