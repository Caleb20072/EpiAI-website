'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded) return;

        // Ne pas vérifier sur la page de vérification elle-même
        if (pathname?.includes('/verify-email')) return;

        // Si pas connecté, pas de vérification
        if (!user) return;

        // Vérifier si l'email principal est vérifié
        const primaryEmail = user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId
        );

        if (primaryEmail && primaryEmail.verification?.status !== 'verified') {
            // Email non vérifié - rediriger
            const locale = pathname?.split('/')[1] || 'fr';
            router.push(`/${locale}/verify-email`);
        }
    }, [user, isLoaded, pathname, router]);

    // Afficher les enfants pendant le chargement ou si tout est OK
    return <>{children}</>;
}
