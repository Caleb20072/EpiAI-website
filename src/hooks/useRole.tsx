'use client';

import { useAuth } from './useAuth';
import { getRoleName, getRoleColor, getRoleLevel, isRoleHigher, canAssignRoles, isAdminRole } from '@/lib/roles/utils';
import type { RoleId } from '@/lib/roles/types';

interface UseRoleReturn {
  roleId: string | undefined;
  roleName: { en: string; fr: string };
  roleLevel: number;
  roleColor: string;
  isAdmin: boolean;
  canAssignRoles: boolean;
  hasRole: (roleId: RoleId) => boolean;
  hasMinimumRole: (roleId: RoleId) => boolean;
  isRoleHigherThan: (otherRoleId: string) => boolean;
}

export function useRole() {
  const { roleId, role, roleLevel, isAdmin, canAssignRoles: canAssign } = useAuth();

  const hasRole = (targetRoleId: RoleId): boolean => {
    return roleId === targetRoleId;
  };

  const hasMinimumRole = (targetRoleId: RoleId): boolean => {
    if (!roleId) return false;
    return roleLevel >= getRoleLevel(targetRoleId);
  };

  const isRoleHigherThan = (otherRoleId: string): boolean => {
    if (!roleId) return false;
    return isRoleHigher(roleId, otherRoleId);
  };

  return {
    roleId,
    roleName: role?.name ?? { en: 'Unknown', fr: 'Inconnu' },
    roleLevel,
    roleColor: role?.color ?? 'text-gray-400',
    isAdmin,
    canAssignRoles: canAssign,
    hasRole,
    hasMinimumRole,
    isRoleHigherThan,
  } as UseRoleReturn;
}

// Helper pour recuperer le nom du role dans la langue courante
export function useRoleName(locale: 'en' | 'fr') {
  const { roleId } = useAuth();

  return {
    getRoleName: (roleId: string) => getRoleName(roleId, locale),
    getRoleColor: (roleId: string) => getRoleColor(roleId),
  };
}
