import { checkUserPermission } from '@/lib/auth/checkPermission';

export async function requireMembershipAdmin() {
  const perm = await checkUserPermission('membership.manage');
  if ('error' in perm) return perm;
  return perm;
}
