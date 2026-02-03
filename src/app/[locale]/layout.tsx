import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Adjusted path
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Chatbot from '@/components/Chatbot';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPI'AI",
  description: "Association Étudiante",
  icons: {
    icon: "/assets/logo.jpg",
    apple: "/assets/logo.jpg",
  }
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
    <html lang={locale} className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <Chatbot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
