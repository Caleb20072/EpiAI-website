'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/ThemeProvider';
import { clerkAppearance } from '@/lib/clerk/appearance';

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
        <ThemeProvider>{children}</ThemeProvider>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
