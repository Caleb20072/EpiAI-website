'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CreateResourceForm } from '@/components/resources/CreateResourceForm';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewResourcePage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { isSignedIn, hasPermission } = useAuth();
  const t = useTranslations('Resources');

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Sign In Required
        </h1>
        <p className="text-white/60 mb-6">
          You need to be signed in to create a new resource.
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

  if (!hasPermission('resources.create')) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Permission Required
        </h1>
        <p className="text-white/60 mb-6">
          You don&apos;t have permission to create new resources.
        </p>
        <Link
          href={`/${locale}/resources`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/resources`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToResources')}
        </Link>
        <h1 className="text-3xl font-bold text-white">{t('addResource')}</h1>
        <p className="text-white/60 mt-2">
          Share a resource with the community.
        </p>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <CreateResourceForm />
      </div>
    </div>
  );
}
