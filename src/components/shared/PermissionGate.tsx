'use client';

import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';
import type { Permission, RoleId } from '@/lib/roles/types';

interface PermissionGateProps {
  permission?: Permission;
  role?: RoleId[];
  roleLevel?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Composant pour afficher/masquer du contenu basé sur les permissions ou rôles.
 */
export function PermissionGate({
  permission,
  role,
  roleLevel,
  children,
  fallback = null,
  className,
}: PermissionGateProps) {
  const { hasPermission, roleId, roleLevel: currentRoleLevel } = useAuth();

  // Check permission if required
  const hasRequiredPermission = permission ? hasPermission(permission) : true;

  // Check specific role if required
  const hasRequiredRole = role && roleId ? role.includes(roleId as RoleId) : true;

  // Check minimum role level if required
  const hasMinimumRoleLevel = roleLevel !== undefined ? currentRoleLevel >= roleLevel : true;

  // User doesn't have required permissions
  if (!hasRequiredPermission || !hasRequiredRole || !hasMinimumRoleLevel) {
    return <>{fallback}</>;
  }

  return <div className={cn('', className)}>{children}</div>;
}
