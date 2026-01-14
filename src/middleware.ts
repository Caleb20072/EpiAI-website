import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Routes protégées (nécessitent une authentification)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/api/dashboard(.*)',
  '/api/profile(.*)',
  '/api/settings(.*)',
  // Note: /api/admin/invite est public pour la création du premier admin
  '/api/admin/bulk-invite(.*)',
  '/(fr|en)/dashboard(.*)',
  '/(fr|en)/profile(.*)',
  '/(fr|en)/admin(.*)',
  '/(fr|en)/settings(.*)',
]);

// Routes publiques (accessibles sans auth)
const isPublicRoute = createRouteMatcher([
  '/',
  '/join',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/setup-admin',
  '/forgot-password',
  '/reset-password',
  '/api/webhooks(.*)',
  '/api/admin/invite(.*)', // Public pour la création du premier admin
  '/(fr|en)',
  '/(fr|en)/join',
  '/(fr|en)/sign-in(.*)',
  '/(fr|en)/sign-up(.*)',
  '/(fr|en)/setup-admin',
  '/(fr|en)/forgot-password',
  '/(fr|en)/reset-password',
  '/(fr|en)/blog(.*)',
  '/(fr|en)/projects(.*)',
  '/(fr|en)/team(.*)',
  '/(fr|en)/about(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Exclure les fichiers statiques (assets, images, etc.)
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/assets/') || pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)) {
    return;
  }

  // Routes publiques ne nécessitent pas d'authentification
  if (isPublicRoute(req)) {
    // For routes that need i18n (page routes, not API routes)
    if (!req.nextUrl.pathname.startsWith('/api')) {
      return createMiddleware(routing)(req);
    }
    return;
  }

  // Protection des routes si nécessaire
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // For routes that need i18n (page routes, not API routes)
  if (!req.nextUrl.pathname.startsWith('/api')) {
    return createMiddleware(routing)(req);
  }
});

export const config = {
  matcher: [
    // Match everything except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - static files in public folder are handled in the middleware function
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
