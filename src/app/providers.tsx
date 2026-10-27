'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/ThemeProvider';
import { clerkAppearance } from '@/lib/clerk/appearance';
import HideNetlifyBadge from '@/components/HideNetlifyBadge';

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
    <ClerkProvider appearance={clerkAppearance} afterSignOutUrl={`/${locale}`}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Paris">
        <ThemeProvider>
          <HideNetlifyBadge />
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
