import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Image from 'next/image';
import BlogSection from '@/components/BlogSection';
import Footer from '@/components/Footer';

export default function Blog() {
  return (
    <div className="relative min-h-screen text-white font-[family-name:var(--font-geist-sans)]">
      <div className="absolute inset-0 -z-10 bg-gray-900">
        <Image
          src="/assets/hero-bg.jpg"
          alt="Background"
          fill
          quality={100}
          className="object-cover brightness-[0.4]"
          priority
        />
      </div>
      <Header />
      <main className="pt-20">
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
}
