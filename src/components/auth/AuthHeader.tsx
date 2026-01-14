'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

interface AuthHeaderProps {
  locale: string;
}

export function AuthHeader({ locale }: AuthHeaderProps) {
  const { isSignedIn, roleName, isAdmin } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <select
          onChange={handleLocaleChange}
          value={locale}
          disabled={isPending}
          className="bg-transparent text-white border border-white/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:bg-black/50 cursor-pointer"
        >
          <option value="en" className="text-black">EN</option>
          <option value="fr" className="text-black">FR</option>
        </select>

        {/* Sign In Link */}
        <Link
          href="/sign-in"
          className="text-white/80 hover:text-white transition-colors text-sm font-medium"
        >
          Sign In
        </Link>

        {/* Join Button */}
        <Link href="/join">
          <button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-4 py-2 rounded-xl transition-all backdrop-blur-sm font-semibold whitespace-nowrap">
            Join
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Language Selector */}
      <select
        onChange={handleLocaleChange}
        value={locale}
        disabled={isPending}
        className="bg-transparent text-white border border-white/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:bg-black/50 cursor-pointer"
      >
        <option value="en" className="text-black">EN</option>
        <option value="fr" className="text-black">FR</option>
      </select>

      {/* Role Badge */}
      <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/70">
        {roleName[locale as 'en' | 'fr']}
        {isAdmin && (
          <span className="w-2 h-2 rounded-full bg-amber-400/80" title="Admin" />
        )}
      </span>

      {/* User Menu */}
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'w-9 h-9 rounded-full border-2 border-white/30 hover:border-white/50 transition-all',
            dropdown: 'bg-zinc-900 border border-white/20 rounded-xl shadow-xl',
            dropdownButton: 'hover:bg-white/10',
            userButtonAvatarBox: 'w-9 h-9',
          },
        }}
      />
    </div>
  );
}
