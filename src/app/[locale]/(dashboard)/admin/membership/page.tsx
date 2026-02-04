import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { isAdminRole } from '@/lib/roles/utils';
import MembershipAdminClient from './client-page';

export default async function MembershipAdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user from Clerk with metadata - SERVER SIDE
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const roleId = (user.publicMetadata?.roleId as number) || (user.publicMetadata?.role as number) || 0;
  const isAdmin = isAdminRole(String(roleId));

  // President = level 9, should have full access
  const canManage = roleId === 9 || isAdmin;

  console.log('[Membership Page Server] User:', user.id);
  console.log('[Membership Page Server] RoleId:', roleId);
  console.log('[Membership Page Server] IsAdmin:', isAdmin);
  console.log('[Membership Page Server] CanManage:', canManage);

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
