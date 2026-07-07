'use client';

import { UserProfile } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const t = useTranslations('Dashboard');

    return (
        <div className="max-w-6xl mx-auto">
            <div className="sticky top-0 z-20 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4 bg-page/95 backdrop-blur-xl border-b border-default -mt-4 sm:-mt-0">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card-muted border border-default text-primary hover:bg-card transition-all text-sm font-medium min-h-[44px]"
                >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span className="truncate">{locale === 'fr' ? 'Retour au dashboard' : 'Back to dashboard'}</span>
                </Link>
                <div className="hidden sm:block text-center flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-primary truncate">{t('settings')}</h1>
                    <p className="text-secondary text-sm truncate">{t('overview')}</p>
                </div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-secondary hover:text-primary hover:bg-card-muted transition-all text-sm font-medium min-h-[44px] shrink-0"
                    aria-label={locale === 'fr' ? 'Fermer les paramètres' : 'Close settings'}
                >
                    <X className="w-5 h-5" />
                    <span className="hidden sm:inline">{locale === 'fr' ? 'Fermer' : 'Close'}</span>
                </Link>
            </div>

            <div className="bg-surface/50 backdrop-blur-xl border border-default rounded-2xl p-4 sm:p-6">
                <UserProfile
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-transparent shadow-none',
                            navbar: 'bg-card rounded-xl',
                            navbarButton: 'text-secondary hover:text-primary hover:bg-card-muted rounded-lg',
                            navbarButtonActive: 'bg-card-muted text-primary',
                            pageScrollBox: 'bg-transparent',
                            page: 'bg-transparent',
                            profileSection: 'bg-card border border-default rounded-xl',
                            profileSectionPrimaryButton: 'bg-brand-600 text-white hover:bg-brand-500 rounded-lg',
                            formButtonPrimary: 'bg-brand-600 text-white hover:bg-brand-500 rounded-lg',
                            formButtonReset: 'text-secondary hover:text-primary hover:bg-card-muted rounded-lg',
                            badge: 'bg-card-muted text-primary border-default',
                            accordionTriggerButton: 'text-secondary hover:text-primary hover:bg-card rounded-lg',
                            accordionContent: 'bg-card rounded-lg',
                            formFieldLabel: 'text-secondary',
                            formFieldInput: 'bg-card border-default text-primary placeholder:text-muted rounded-lg',
                            identityPreviewText: 'text-primary',
                            identityPreviewEditButton: 'text-secondary hover:text-primary',
                            headerTitle: 'text-primary',
                            headerSubtitle: 'text-secondary',
                            socialButtonsBlockButton: 'bg-card-muted border-default text-primary hover:bg-card-muted rounded-lg',
                            dividerLine: 'bg-card-muted',
                            dividerText: 'text-muted',
                            avatarImageActionsUpload: 'text-secondary hover:text-primary',
                            avatarImageActionsRemove: 'text-red-400 hover:text-red-300',
                            fileDropAreaBox: 'bg-card border-default rounded-lg',
                            fileDropAreaIconBox: 'text-muted',
                            fileDropAreaText: 'text-secondary',
                            fileDropAreaButtonPrimary: 'bg-brand-600 text-white hover:bg-brand-500 rounded-lg',
                        },
                    }}
                    routing="path"
                    path={`/${locale}/settings`}
                />
            </div>
        </div>
    );
}
