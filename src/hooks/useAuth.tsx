'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { ROLES, isValidRole } from '@/lib/roles/definitions';
import { hasPermission, isAdminRole } from '@/lib/roles/utils';
import type { Permission, RoleLevel } from '@/lib/roles/types';

interface UseAuthReturn {
  isSignedIn: boolean;
  userId: string | null | undefined;
  roleId: string | undefined;
  role: typeof ROLES['president'] | undefined;
  roleLevel: RoleLevel;
  roleName: { en: string; fr: string };
  permissions: Set<Permission>;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  isPresident: boolean;
  canAssignRoles: boolean;
}

export function useAuth() {
  const { isSignedIn, userId, sessionClaims } = useClerkAuth();

  const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
  const roleId = (metadata?.roleId as string | undefined) || undefined;
  const role = roleId && isValidRole(roleId) ? ROLES[roleId] : undefined;
  const roleLevel = role?.level ?? 0;

  const permissions = useMemo(() => {
    return new Set(role?.permissions ?? []);
  }, [role]);

  const hasPermissionFn = (permission: Permission): boolean => {
    return hasPermission(roleId, permission);
  };

  return {
    isSignedIn: isSignedIn ?? false,
    userId,
    roleId,
    role,
    roleLevel,
    roleName: role?.name ?? { en: 'Unknown', fr: 'Inconnu' },
    permissions,
    hasPermission: hasPermissionFn,
    isAdmin: isAdminRole(roleId ?? ''),
    isPresident: roleId === 'president',
    canAssignRoles: roleId === 'president' || roleId === 'admin_general' || roleId === 'chef_pole',
  } as UseAuthReturn;
}
