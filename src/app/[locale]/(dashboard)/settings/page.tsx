'use client';

import { UserProfile } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function SettingsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'en';

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
                        <p className="text-white/60">Manage your account settings and preferences</p>
                    </div>
                </div>
                <Link
                    href="/dashboard"
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Close settings"
                >
                    <X className="w-6 h-6" />
                </Link>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <UserProfile
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-transparent shadow-none',
                            navbar: 'bg-white/5 rounded-xl',
                            navbarButton: 'text-white/70 hover:text-white hover:bg-white/10 rounded-lg',
                            navbarButtonActive: 'bg-white/10 text-white',
                            pageScrollBox: 'bg-transparent',
                            page: 'bg-transparent',
                            profileSection: 'bg-white/5 border border-white/10 rounded-xl',
                            profileSectionPrimaryButton: 'bg-white text-black hover:bg-white/90 rounded-lg',
                            formButtonPrimary: 'bg-white text-black hover:bg-white/90 rounded-lg',
                            formButtonReset: 'text-white/70 hover:text-white hover:bg-white/10 rounded-lg',
                            badge: 'bg-white/10 text-white border-white/20',
                            accordionTriggerButton: 'text-white/70 hover:text-white hover:bg-white/5 rounded-lg',
                            accordionContent: 'bg-white/5 rounded-lg',
                            formFieldLabel: 'text-white/70',
                            formFieldInput: 'bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-lg',
                            identityPreviewText: 'text-white',
                            identityPreviewEditButton: 'text-white/70 hover:text-white',
                            headerTitle: 'text-white',
                            headerSubtitle: 'text-white/60',
                            socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg',
                            dividerLine: 'bg-white/10',
                            dividerText: 'text-white/40',
                            avatarImageActionsUpload: 'text-white/70 hover:text-white',
                            avatarImageActionsRemove: 'text-red-400 hover:text-red-300',
                            fileDropAreaBox: 'bg-white/5 border-white/20 rounded-lg',
                            fileDropAreaIconBox: 'text-white/40',
                            fileDropAreaText: 'text-white/60',
                            fileDropAreaButtonPrimary: 'bg-white text-black hover:bg-white/90 rounded-lg',
                        },
                    }}
                    routing="path"
                    path={`/${locale}/settings`}
                />
            </div>
        </div>
    );
}
