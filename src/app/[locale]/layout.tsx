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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Epi'AI — Association IA et data science | Epitech",
    template: "%s | Epi'AI",
  },
  description:
    "Association étudiante Epitech dédiée aux mathématiques, à l'intelligence artificielle et à la data science. Projets, talks, formation et communauté.",
  keywords: [
    "Epi'AI",
    'EpiAI',
    'Epitech',
    'intelligence artificielle',
    'data science',
    'machine learning',
    'association étudiante',
    'Bénin',
  ],
  authors: [{ name: "Epi'AI" }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: "Epi'AI",
    title: "Epi'AI — Association IA et data science | Epitech",
    description:
      "Une association pensée par les étudiants, dirigée par les étudiants et au service de la communauté étudiante.",
    images: [{ url: '/assets/epiai-logo.png', width: 512, height: 512, alt: "Epi'AI" }],
  },
  twitter: {
    card: 'summary',
    title: "Epi'AI — Association IA et data science",
    description: "Association étudiante Epitech : mathématiques, IA et data science.",
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  manifest: '/manifest.webmanifest',
  applicationName: "Epi'AI",
  appleWebApp: {
    capable: true,
    title: "Epi'AI",
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D1B4A' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1B4A' },
  ],
  // Le visual viewport rétrécit avec le clavier : le chat se compacte au-dessus.
  interactiveWidget: "resizes-visual",
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
