'use client';

import { useAuth, SignIn } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string || routing.defaultLocale;
  const { isSignedIn } = useAuth();

  // Si l'utilisateur est déjà connecté, montrer un message
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">
            Already Signed In
          </h1>
          <p className="text-white/70 mb-6">
            You are already signed in. If you need to reset your password, please contact an administrator.
          </p>
          <a
            href={`/${locale}/dashboard`}
            className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <SignIn
        routing="path"
        path={`/${locale}/sign-in`}
        signUpUrl={`/${locale}/sign-up`}
        redirectUrl={`/${locale}/dashboard`}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl',
            headerTitle: 'text-white text-2xl font-bold',
            headerSubtitle: 'text-white/60',
            socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
            formButtonPrimary: 'bg-white text-black hover:bg-white/90 font-semibold rounded-xl',
            formFieldLabel: 'text-white/70',
            formFieldInput: 'bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl',
            footerActionLink: 'text-white/70 hover:text-white',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-white/70',
          },
        }}
      />
    </div>
  );
}
