import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdminRole } from '@/lib/roles/utils';
import MembershipAdminClient from './client-page';

export default async function MembershipAdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  let canManage = false;
  let roleId: string | number = 0;

  try {
    // Get user from Clerk with metadata - SERVER SIDE
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);

    roleId = (user.publicMetadata?.roleId as number) || (user.publicMetadata?.role as string) || 0;
    const isAdmin = isAdminRole(String(roleId));

    // President = level 9, should have full access
    canManage = roleId === 9 || isAdmin;

    console.log('[Membership Page Server] User:', user.id, '| RoleId:', roleId, '| CanManage:', canManage);
  } catch (err) {
    console.error('[Membership Page Server] Clerk API error:', err);
    // Fallback: allow access if auth passed but Clerk metadata unavailable
    canManage = true;
  }

  if (!canManage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/60">You don't have permission to manage memberships.</p>
          <p className="text-sm text-white/40 mt-2">Role ID: {roleId}</p>
        </div>
      </div>
    );
  }

  // User has permission, render the client component
  return <MembershipAdminClient />;
}
