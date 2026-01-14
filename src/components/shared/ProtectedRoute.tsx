'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Permission, RoleId } from '@/lib/roles/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: RoleId[];
  requiredMinimumRoleLevel?: number;
  redirectToSignIn?: boolean;
  className?: string;
}

/**
 * Composant pour protéger les routes.
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 * Peut aussi vérifier les permissions et rôles.
 */
export function ProtectedRoute({
  children,
  fallback,
  requiredPermission,
  requiredRole,
  requiredMinimumRoleLevel,
  redirectToSignIn = true,
  className,
}: ProtectedRouteProps) {
  const { isSignedIn, hasPermission, roleId, roleLevel } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = isSignedIn;

  // Check permission if required
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;

  // Check specific role if required
  const hasRequiredRole = requiredRole && roleId ? requiredRole.includes(roleId as RoleId) : true;

  // Check minimum role level if required
  const hasMinimumRoleLevel = requiredMinimumRoleLevel !== undefined ? roleLevel >= requiredMinimumRoleLevel : true;

  // User is not authenticated or doesn't have required permissions
  if (!isAuthenticated || !hasRequiredPermission || !hasRequiredRole || !hasMinimumRoleLevel) {
    // Redirect to sign in if not authenticated and redirect is enabled
    if (!isAuthenticated && redirectToSignIn && !fallback) {
      useEffect(() => {
        const locale = pathname.startsWith('/fr') ? 'fr' : 'en';
        router.push(`/${locale}/sign-in?redirect_url=${pathname}`);
      }, [router, pathname]);
      return null;
    }
    return <>{fallback}</>;
  }

  return <div className={cn('', className)}>{children}</div>;
}
