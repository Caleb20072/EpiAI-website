'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CreateThreadForm } from '@/components/forum/CreateThreadForm';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewThreadPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, hasPermission } = useAuth();
  const t = useTranslations('Forum');

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Sign In Required
        </h1>
        <p className="text-white/60 mb-6">
          You need to be signed in to create a new discussion.
        </p>
        <Link
          href={`/${locale}/sign-in`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Link>
      </div>
    );
  }

  if (!hasPermission('content.create')) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Permission Required
        </h1>
        <p className="text-white/60 mb-6">
          You don&apos;t have permission to create new discussions.
        </p>
        <Link
          href={`/${locale}/forum`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/forum`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToForum')}
        </Link>
        <h1 className="text-3xl font-bold text-white">{t('createNewThread')}</h1>
        <p className="text-white/60 mt-2">
          Start a new discussion with the community.
        </p>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <CreateThreadForm />
      </div>
    </div>
  );
}
