'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { Button, FormShell, Input } from '@/components/ui';

export default function ChangePasswordPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'fr';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && passwordsMatch;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!isValid) {
            setError('Veuillez respecter tous les critères de mot de passe');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Échec du changement de mot de passe');
            }

            setSuccess(true);

            setTimeout(() => {
                router.push(`/${locale}/dashboard`);
            }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 mb-4">
                        <Lock className="w-7 h-7 text-brand-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary mb-2">
                        Changement de mot de passe requis
                    </h1>
                    <p className="text-secondary text-sm">
                        Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire
                    </p>
                </div>

                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-3">
                        <Check className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-brand-700 font-medium">Mot de passe changé avec succès !</p>
                            <p className="text-secondary text-sm mt-1">Redirection en cours...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <FormShell>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-medium text-secondary mb-1.5 block">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-secondary mb-1.5 block">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-card-muted rounded-xl p-4 space-y-2 border border-subtle">
                            <p className="text-sm font-medium text-secondary mb-2">Critères requis :</p>
                            <PasswordRequirement met={hasMinLength} text="Au moins 8 caractères" />
                            <PasswordRequirement met={hasUpperCase} text="Au moins une majuscule" />
                            <PasswordRequirement met={hasLowerCase} text="Au moins une minuscule" />
                            <PasswordRequirement met={hasNumber} text="Au moins un chiffre" />
                            <PasswordRequirement met={passwordsMatch} text="Les mots de passe correspondent" />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={!isValid || loading || success}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Changement en cours...
                                </>
                            ) : success ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Changé avec succès
                                </>
                            ) : (
                                'Changer le mot de passe'
                            )}
                        </Button>
                    </form>
                </FormShell>
            </div>
        </div>
    );
}

interface PasswordRequirementProps {
    met: boolean;
    text: string;
}

function PasswordRequirement({ met, text }: PasswordRequirementProps) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${met ? 'bg-brand-500/20' : 'bg-card-muted'}`}>
                {met && <Check className="w-3 h-3 text-brand-600" />}
            </div>
            <span className={`text-sm ${met ? 'text-brand-700' : 'text-muted'}`}>
                {text}
            </span>
        </div>
    );
}
