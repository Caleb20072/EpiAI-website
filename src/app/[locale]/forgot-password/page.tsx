'use client';

import { useAuth, SignIn } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { clerkAppearance } from '@/lib/clerk/appearance';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string || routing.defaultLocale;
  const { isSignedIn } = useAuth();

  // Si l'utilisateur est déjà connecté, montrer un message
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1d3a7a_0%,_#0d1b4a_42%,_#0a1022_100%)]">
        <div className="text-center p-8 bg-[#131c33] border border-[rgba(134,174,246,0.24)] rounded-2xl max-w-md">
          <h1 className="text-2xl font-semibold text-[#edf0f5] mb-4">
            Already Signed In
          </h1>
          <p className="text-[#c3c9d6] mb-6">
            You are already signed in. If you need to reset your password, please contact an administrator.
          </p>
          <a
            href={`/${locale}/dashboard`}
            className="inline-block bg-[#3479f0] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2361d6] transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1d3a7a_0%,_#0d1b4a_42%,_#0a1022_100%)]">
      <SignIn
        routing="path"
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        redirectUrl={`/${locale}/dashboard`}
        appearance={clerkAppearance}
      />
    </div>
  );
}
