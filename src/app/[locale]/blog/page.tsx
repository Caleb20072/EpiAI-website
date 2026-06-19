import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import Image from 'next/image';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/blog',
    title: locale === 'fr' ? "Blog Epi'AI" : "Epi'AI Blog",
    description:
      locale === 'fr'
        ? "Actualités, tutoriels et recherche de la communauté Epi'AI."
        : 'News, tutorials and research from the Epi\'AI community.',
  });
}

export default function Blog() {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image
          src="/assets/hero-bg.jpg"
          alt=""
          fill
          quality={100}
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>
      <main className="pt-20">
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
}
