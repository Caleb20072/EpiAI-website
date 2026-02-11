'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordResetCheck } from '@/hooks/usePasswordResetCheck';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useRouter, usePathname } from 'next/navigation'; // Changed from '@/i18n/routing'
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl'; // Added
import {
  LayoutDashboard,
  User,
  Settings,
  Users,
  LogOut,
  Menu,
  ChevronRight,
  MessageSquare,
  Calendar,
  FolderOpen,
  UserPlus,
  Plus,
} from 'lucide-react';
import { UserButton, useClerk, useUser } from '@clerk/nextjs';
import { getRoleName } from '@/lib/roles/utils';
import { cn } from '@/lib/utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, roleId, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  usePasswordResetCheck();

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
      active: pathname === `/${locale}/dashboard`,
    },
    {
      label: 'Resources',
      href: `/${locale}/resources`,
      icon: FolderOpen,
      active: pathname.startsWith(`/${locale}/resources`),
    },
    {
      label: 'Forum',
      href: `/${locale}/forum`,
      icon: MessageSquare,
      active: pathname.startsWith(`/${locale}/forum`),
    },
    {
      label: 'Events',
      href: `/${locale}/events`,
      icon: Calendar,
      active: pathname.startsWith(`/${locale}/events`),
    },
    {
      label: 'Profile',
      href: `/${locale}/profile`,
      icon: User,
      active: pathname === `/${locale}/profile`,
    },
  ];

  // Admin items
  const adminItems = [
    {
      label: 'Membership',
      href: `/${locale}/admin/membership`,
      icon: UserPlus,
      active: pathname.startsWith(`/${locale}/admin/membership`),
      adminOnly: true,
    },
    {
      label: 'Projects',
      href: `/${locale}/admin/projects`,
      icon: FolderOpen,
      active: pathname.startsWith(`/${locale}/admin/projects`),
      adminOnly: true,
    },
    {
      label: 'Admin',
      href: `/${locale}/admin`,
      icon: Users,
      active: pathname === `/${locale}/admin`,
      adminOnly: true,
    },
  ];

  return (
    <ProtectedRoute
      redirectToSignIn
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-zinc-950">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <Link href={`/${locale}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
                <div>
                  <span className="text-white font-bold text-lg">EPI&apos;AI</span>
                  <p className="text-white/50 text-xs">Dashboard</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      item.active
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}

              {/* Admin Section */}
              {isAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      Admin
                    </p>
                  </div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                          item.active
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'text-white/60 hover:text-amber-400 hover:bg-amber-500/5'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </Link>
                    );
                  })}

                  {/* New Project Button - Always visible for admins */}
                  {isAdmin && (
                    <div className="px-4 pt-2">
                      <a
                        href={`/${locale}/admin/projects/new`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all no-underline shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span>NEW PROJECT</span>
                      </a>
                    </div>
                  )}
                </>
              )}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <UserButton
                  afterSignOutUrl={`/${locale}`}
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 rounded-full',
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.firstName || user?.username || user?.emailAddresses[0]?.emailAddress || 'User'}
                  </p>
                  <p className={cn(
                    'text-xs truncate',
                    roleId ? 'text-amber-400' : 'text-white/40'
                  )}>
                    {roleId ? getRoleName(roleId, locale as 'en' | 'fr') : 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-72">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white/70 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-white font-bold">EPI&apos;AI</span>
            <UserButton
              afterSignOutUrl={`/${locale}`}
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 rounded-full',
                },
              }}
            />
          </header>

          {/* Page Content */}
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
