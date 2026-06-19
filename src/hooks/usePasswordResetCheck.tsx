'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

export function usePasswordResetCheck() {
    const router = useRouter();
    const pathname = usePathname();
    const { isSignedIn, userId } = useAuth();

    useEffect(() => {
        async function checkPasswordReset() {
            // Ne pas vérifier si l'utilisateur n'est pas connecté
            if (!isSignedIn || !userId) return;

            // Ne pas rediriger si déjà sur la page de changement de mot de passe
            if (pathname?.includes('/change-password')) return;

            try {
                // Récupérer les métadonnées de l'utilisateur via Clerk
                const response = await fetch('/api/auth/check-password-reset');
                const data = await response.json();

                if (data.mustResetPassword) {
                    // Extraire la locale du pathname
                    const locale = pathname?.split('/')[1] || 'fr';
                    router.push(`/${locale}/change-password`);
                }
            } catch (error) {
                console.error('Error checking password reset status:', error);
            }
        }

        checkPasswordReset();
    }, [isSignedIn, userId, pathname, router]);
}
