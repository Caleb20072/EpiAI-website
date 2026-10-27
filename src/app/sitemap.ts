import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['fr', 'en'];
  const staticPaths = ['', '/about', '/blog', '/partners', '/calendar', '/team', '/projects', '/join'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }

  try {
    const [posts, events, projects] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.event.findMany({
        where: { isPublished: true },
        select: { id: true, updatedAt: true },
      }),
      prisma.project.findMany({
        where: { published: true },
        select: { id: true, updatedAt: true },
      }),
    ]);

    for (const locale of locales) {
      for (const post of posts) {
        entries.push({
          url: `${BASE}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
      for (const event of events) {
        entries.push({
          url: `${BASE}/${locale}/calendar/${event.id}`,
          lastModified: event.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
      for (const project of projects) {
        entries.push({
          url: `${BASE}/${locale}/projects/${project.id}`,
          lastModified: project.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB unavailable at build time — static entries only
  }

  return entries;
}
