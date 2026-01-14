'use client';

import { SignUp } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function SignUpPage() {
  const params = useParams();
  const locale = params.locale as string || routing.defaultLocale;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <SignUp
        routing="path"
        path={`/${locale}/sign-up`}
        signInUrl={`/${locale}/sign-in`}
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
