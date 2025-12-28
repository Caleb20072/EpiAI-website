"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { ChangeEvent, useTransition } from 'react';

export default function Header() {
    const t = useTranslations('Header');
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl flex items-center justify-between px-8 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-white/30">
                        <Image
                            src="/assets/logo.jpg"
                            alt="EPI'AI Logo"
                            fill
                            className="object-cover"
                            sizes="40px"
                        />
                    </div>
                    <span className="font-bold text-white text-xl hidden sm:block">EPI'AI</span>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#about" className="text-white/80 hover:text-white transition-colors">{t('about')}</Link>
                    <Link href="/#team" className="text-white/80 hover:text-white transition-colors">{t('team')}</Link>
                    <Link href="/blog" className="text-white/80 hover:text-white transition-colors">{t('blog')}</Link>
                    <Link href="/#projects" className="text-white/80 hover:text-white transition-colors">{t('projects')}</Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <select
                        onChange={handleChange}
                        defaultValue={pathname.startsWith('/fr') ? 'fr' : 'en'} // Simple check for demo
                        disabled={isPending}
                        className="bg-transparent text-white border border-white/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:bg-black/50"
                    >
                        <option value="en" className="text-black">EN</option>
                        <option value="fr" className="text-black">FR</option>
                    </select>

                    <Link href="/join">
                        <button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-4 py-2 rounded-xl transition-all backdrop-blur-sm font-semibold whitespace-nowrap">
                            {t('join')}
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
