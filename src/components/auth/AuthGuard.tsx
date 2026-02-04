'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string[];
  requiredMinimumRoleLevel?: number;
  redirectToSignIn?: boolean;
  className?: string;
}

export function AuthGuard({
  children,
  fallback,
  requiredPermission,
  requiredRole,
  requiredMinimumRoleLevel,
  redirectToSignIn = true,
  className,
}: AuthGuardProps) {
  const { isSignedIn, hasPermission, roleId, roleLevel } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is authenticated
  if (!isSignedIn) {
    if (redirectToSignIn && !fallback) {
      useEffect(() => {
        router.push(`/${pathname.startsWith('/fr') ? 'fr' : 'en'}/sign-in?redirect_url=${pathname}`);
      }, [router, pathname]);
      return null;
    }
    return <>{fallback}</>;
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return <>{fallback}</>;
  }

  // Check specific role if required
  if (requiredRole && roleId && !requiredRole.includes(roleId)) {
    return <>{fallback}</>;
  }

  // Check minimum role level if required
  if (requiredMinimumRoleLevel !== undefined && roleLevel < requiredMinimumRoleLevel) {
    return <>{fallback}</>;
  }

  return <div className={cn('', className)}>{children}</div>;
}
