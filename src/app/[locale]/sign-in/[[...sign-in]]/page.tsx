'use client';

import { SignIn } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { BrandWordmark } from '@/components/BrandLogo';
import { clerkAppearance } from '@/lib/clerk/appearance';

export default function SignInPage() {
  const params = useParams();
  const locale = (params.locale as string) || routing.defaultLocale;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1d3a7a_0%,_#0d1b4a_42%,_#0a1022_100%)] px-4 py-8">
      <Link href={`/${locale}`} className="mb-8">
        <BrandWordmark size="lg" priority />
      </Link>
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path={`/${locale}/sign-in`}
          signUpUrl={`/${locale}/sign-up`}
          redirectUrl={`/${locale}/dashboard`}
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
