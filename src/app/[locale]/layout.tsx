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
      "Les maths, l'IA et la data, apprises ensemble. Association étudiante Epitech.",
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
  // Le clavier recouvre l’écran : on rétrécit le chat nous-mêmes (comme WhatsApp).
  interactiveWidget: "overlays-content",
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
