'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, Crown, Mail, User, Lock } from 'lucide-react';
import { useAdminInvite } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils/cn';

export default function SetupAdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('SetupAdmin');
  const { needsFirstAdmin, isLoading } = useAdminInvite();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const locale = pathname.split('/')[1] || 'fr';

  // Si pas besoin de premier admin, rediriger vers dashboard ou sign-in
  useEffect(() => {
    if (!isLoading && !needsFirstAdmin) {
      router.push(`/${locale}/sign-in`);
    }
  }, [isLoading, needsFirstAdmin, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          roleId: 'president',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create president account');
      }

      setSuccess(true);

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/fr/sign-in');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{t('successTitle')}</h1>
          <p className="text-white/60 mb-6">{t('successMessage')}</p>
          <p className="text-sm text-white/40">
            Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-white/60 mt-2">{t('subtitle')}</p>
        </div>

        {/* Form */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('firstName')}
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="Prénom"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('lastName')}
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="Nom"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="email@epitech.eu"
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-medium text-sm mb-1">{t('passwordInfoTitle')}</p>
                  <p className="text-amber-400/70 text-xs">{t('passwordInfoText')}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-400 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('creating')}
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  {t('createPresident')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
