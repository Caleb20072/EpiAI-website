import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "../globals.css";
import { getMessages } from 'next-intl/server';
import Chatbot from '@/components/Chatbot';
import { Providers } from '@/app/providers';
import HeaderWrapper from '@/components/HeaderWrapper';
import { themeBootScript } from '@/lib/theme';

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-serif",
  display: "swap",
});

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
    <html lang={locale} className={`scroll-smooth ${plex.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootScript,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-card focus:text-primary focus:rounded-lg focus:shadow-md"
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
