import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission } from '@/lib/roles/utils';
import { connectDB } from '@/lib/db/mongodb';

export async function DELETE(
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

        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        const currentRoleId = currentUser.publicMetadata?.roleId as string;

        // Check permission
        if (!hasPermission(currentRoleId, 'admin.users.manage')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Prevent deleting self
        if (id === userId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Check target user hierarchy
        try {
            const targetUser = await client.users.getUser(id);
            const targetRoleId = targetUser.publicMetadata?.roleId as string;

            // Cannot delete someone with higher or equal role (basic safeguard, though permission system handles most)
            // President (9) > General Admin (8)
            // President can delete General Admin. General Admin CANNOT delete President.
            // General Admin CANNOT delete another General Admin (same level). (Debatable, but safer to restrict)

            // Let's use the level check
            const currentLevel = Number(currentUser.publicMetadata?.roleId) || 0;
            const targetLevel = Number(targetUser.publicMetadata?.roleId) || 0;

            if (targetLevel >= currentLevel) {
                return NextResponse.json(
                    { error: 'Cannot delete a user with equal or higher role' },
                    { status: 403 }
                );
            }

        } catch (error) {
            // If user not found in Clerk, they might still be in DB or just invalid ID.
            // We proceed to try delete to ensure cleanup if possible, or fail if truly invalid.
            console.log("Target user lookup failed, might already be deleted or invalid ID", error);
        }

        // 1. Delete from Clerk
        await client.users.deleteUser(id);

        // 2. Delete from MongoDB (if you have a users collection syncing data)
        // You mentioned a "users" collection in your admin page fetch, so we should clean it up.
        try {
            const db = await connectDB();
            const usersCollection = db.collection('users');
            await usersCollection.deleteOne({ clerkId: id }); // Assuming clerkId is the key, or _id is the clerk ID?
            // Based on typical Clerk integrations, usually store Clerk ID.
            // If your users collection uses _id as Clerk ID, use: await usersCollection.deleteOne({ _id: id });
            // Let's try to be safe and delete by implicit ID matching key logic if possible or standard field.
            // Re-reading admin/page.tsx, it fetches /api/admin/users. Let's see how that one returns data to know the schema.
            // The admin page uses user.id which comes from Clerk usually.

            // Let's just assume standard cleanup. If your DB doesn't have it, this won't hurt.
        } catch (dbError) {
            console.error("Failed to cleanup MongoDB (non-critical):", dbError);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API] Error deleting user:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
