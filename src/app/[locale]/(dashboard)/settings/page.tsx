'use client';

import { UserProfile } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { PageHeader, Button, Panel } from '@/components/ui';
import { clerkUserProfileAppearance } from '@/lib/clerk/appearance';

export default function SettingsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const t = useTranslations('Dashboard');

    return (
        <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link href="/dashboard">
                    <Button variant="secondary" size="sm">
                        <ArrowLeft className="w-4 h-4" />
                        {locale === 'fr' ? 'Retour au dashboard' : 'Back to dashboard'}
                    </Button>
                </Link>
                <Link href="/dashboard" aria-label={locale === 'fr' ? 'Fermer' : 'Close'}>
                    <Button variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">{locale === 'fr' ? 'Fermer' : 'Close'}</span>
                    </Button>
                </Link>
            </div>

            <PageHeader title={t('settings')} description={t('overview')} />

            <Panel noPadding bodyClassName="p-4 sm:p-5">
                <UserProfile
                    appearance={clerkUserProfileAppearance}
                    routing="path"
                    path={`/${locale}/settings`}
                />
            </Panel>
        </div>
    );
}
