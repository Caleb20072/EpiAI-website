'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useMemo, useEffect, useState } from 'react';
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
  isLoading: boolean;
}

export function useAuth() {
  const { isSignedIn, userId } = useClerkAuth();
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch metadata from server
  useEffect(() => {
    async function fetchMetadata() {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setMetadata(data.publicMetadata || {});
        }
      } catch (error) {
        console.error('[useAuth] Error fetching metadata:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetadata();
  }, [isSignedIn, userId]);

  // Use 'role' (string) first, then fall back to 'roleId' as string
  const roleId = (metadata?.role as string | undefined) || String(metadata?.roleId || '');

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
    roleName: role?.name ?? { en: 'Member', fr: 'Membre' },
    permissions,
    hasPermission: hasPermissionFn,
    isAdmin: isAdminRole(roleId ?? ''),
    isPresident: roleId === 'president',
    canAssignRoles: roleId === 'president' || roleId === 'admin_general' || roleId === 'chef_pole',
    isLoading,
  } as UseAuthReturn;
}

