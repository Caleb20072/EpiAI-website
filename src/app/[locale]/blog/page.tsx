import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
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
    <div className="paper-page min-h-screen overflow-x-hidden">
      <main className="pt-20">
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
}
