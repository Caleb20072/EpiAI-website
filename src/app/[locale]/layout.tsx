import type { Metadata } from "next";
import "../globals.css";
import { getMessages } from 'next-intl/server';
import Chatbot from '@/components/Chatbot';
import { Providers } from '@/app/providers';
import HeaderWrapper from '@/components/HeaderWrapper';

export const metadata: Metadata = {
  title: "EPI'AI",
  description: "Association Étudiante",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/assets/epiai-logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/assets/epiai-logo.png',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg"
        >
          {locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
        </a>
        <Providers locale={locale} messages={messages}>
          <HeaderWrapper />
          <div id="main-content">{children}</div>
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
