'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PageHeader, Card, EmptyState, Button } from '@/components/ui';

interface BlogPost {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  status: string;
  category: string;
  publishedAt: string | null;
}

export default function AdminBlogPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog?admin=true')
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const remove = async (slug: string) => {
    if (!confirm(locale === 'fr' ? 'Supprimer cet article ?' : 'Delete this post?')) return;
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
    if (res.ok) setPosts((p) => p.filter((x) => x.slug !== slug));
  };

  return (
    <PermissionGate permission="content.create">
      <div className="space-y-6">
        <PageHeader
          title={locale === 'fr' ? 'Gestion du blog' : 'Blog management'}
          description={
            locale === 'fr'
              ? 'Publiez les actualités du pôle Recherche & Com.'
              : 'Publish news from the Research & Com pole.'
          }
          actions={
            <Link
              href={`/${locale}/admin/blog/new`}
              className="inline-flex items-center justify-center font-semibold transition-colors gap-2 px-4 py-2 text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-500"
            >
              <Plus className="w-4 h-4" />
              {locale === 'fr' ? 'Nouvel article' : 'New post'}
            </Link>
          }
        />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" />}
            title={locale === 'fr' ? 'Aucun article.' : 'No posts yet.'}
          />
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Card padding="sm" className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-primary font-medium truncate">
                    {locale === 'fr' ? post.titleFr : post.titleEn}
                  </p>
                  <p className="text-muted text-xs mt-1">
                    {post.category} · {post.status}
                    {post.publishedAt &&
                      ` · ${new Date(post.publishedAt).toLocaleDateString(locale)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/${locale}/admin/blog/${post.slug}/edit`}
                    className="p-2 rounded-lg bg-card hover:bg-card-muted text-secondary"
                    aria-label={locale === 'fr' ? 'Modifier' : 'Edit'}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(post.slug)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500"
                    aria-label={locale === 'fr' ? 'Supprimer' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PermissionGate>
  );
}
