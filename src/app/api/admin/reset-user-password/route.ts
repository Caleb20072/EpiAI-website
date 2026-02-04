import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// POST /api/admin/reset-user-password - Reset a user's password
export async function POST(request: NextRequest) {
    try {
        const { userId: adminId } = await auth();

        if (!adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: 'Missing userId or newPassword' },
                { status: 400 }
            );
        }

        // Update user password
        const client = await clerkClient();
        await client.users.updateUser(userId, {
            password: newPassword,
        });

        console.log('[Reset Password] Password updated for user:', userId);

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error: any) {
        console.error('[Reset Password] Error:', error);

        return NextResponse.json(
            { error: error.message || 'Failed to reset password' },
            { status: 500 }
        );
    }
}
