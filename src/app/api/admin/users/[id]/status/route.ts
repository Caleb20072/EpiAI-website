import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { hasPermission, resolveRoleSlug } from '@/lib/roles/utils';
import { prisma } from '@/lib/prisma';
import type { MemberStatus } from '@prisma/client';

const VALID_STATUSES: MemberStatus[] = ['active', 'pending', 'approved'];

// PATCH /api/admin/users/[id]/status — valider fin de période d'essai, etc.
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const currentRoleSlug = resolveRoleSlug(currentUser.publicMetadata as Record<string, unknown>);

    if (!hasPermission(currentRoleSlug, 'admin.users.manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: targetClerkId } = await context.params;
    const { memberStatus } = await request.json();

    if (!memberStatus || !VALID_STATUSES.includes(memberStatus)) {
      return NextResponse.json({ error: 'Invalid member status' }, { status: 400 });
    }

    const updated = await prisma.user.updateMany({
      where: { clerkId: targetClerkId },
      data: { memberStatus },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({ success: true, memberStatus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[API] Error updating member status:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
