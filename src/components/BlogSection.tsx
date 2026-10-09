import { getTranslations, getLocale } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { getPublishedPosts } from '@/lib/blog/repository';
import { localizeCategory } from '@/lib/i18n/labels';

export default async function BlogSection() {
  const tHeader = await getTranslations('Header');
  const locale = await getLocale();
  const posts = await getPublishedPosts(6);

  const intro =
    locale === 'fr'
      ? 'Les dernières actualités et tutoriels de la communauté Epi’AI.'
      : 'Latest news and tutorials from the Epi’AI community.';

  if (posts.length === 0) {
    return (
      <section id="blog" className="px-6 py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1280px]">
          <h1 className="section-title text-primary">{tHeader('blog')}</h1>
          <p className="mt-3 text-[17px] text-secondary">{intro}</p>
          <div className="mt-10 rounded-xl border border-dashed border-default bg-card px-6 py-10 text-[16px] text-secondary">
            {locale === 'fr' ? 'Aucun article publié pour le moment.' : 'No published posts yet.'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="px-6 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="mb-10 max-w-xl">
          <h1 className="section-title text-primary">{tHeader('blog')}</h1>
          <p className="mt-3 text-[17px] leading-[1.6] text-secondary">{intro}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const title = locale === 'fr' ? post.titleFr : post.titleEn;
            const excerpt = locale === 'fr' ? post.excerptFr : post.excerptEn;
            const date = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '';

            return (
              <article
                key={post.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-default bg-card shadow-card transition-[border-color,box-shadow] duration-200 hover:border-brand-300 hover:shadow-elevated"
              >
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10 rounded-xl" aria-label={title} />
                <div className="relative aspect-[16/9] overflow-hidden border-b border-default bg-brand-50">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-end p-5">
                      <span className="font-display text-[24px] leading-tight text-brand-800 line-clamp-3">{title}</span>
                    </div>
                  )}
                  {post.category ? (
                    <span className="absolute left-3 top-3 rounded-md bg-card px-2 py-0.5 text-[12px] font-medium text-primary shadow-sm">
                      {localizeCategory(post.category, locale)}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[13px] text-muted">
                    {date}
                    {post.authorName ? <> · {post.authorName}</> : null}
                  </p>
                  <h2 className="mt-2 text-[18px] font-semibold leading-snug text-primary transition-colors duration-[160ms] group-hover:text-brand-700">
                    {title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-[1.6] text-secondary">{excerpt}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
