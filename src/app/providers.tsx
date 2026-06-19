'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, string>;
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-white text-black hover:bg-white/90 font-semibold rounded-xl',
          footerActionLink: 'text-white/70 hover:text-white',
          card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl',
          headerTitle: 'text-white text-2xl font-bold',
          headerSubtitle: 'text-white/60',
          socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
          formFieldLabel: 'text-white/70',
          formFieldInput: 'bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-white/70',
        },
      }}
      afterSignOutUrl={`/${locale}`}
    >
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Paris">
        {children}
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
