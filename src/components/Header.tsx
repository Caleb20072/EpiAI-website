"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandWordmark } from '@/components/BrandLogo';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const dashboardRoutes = [
    '/dashboard', '/admin', '/profile', '/settings',
    '/resources', '/forum', '/events', '/modules', '/presence', '/my-registrations',
    '/my-resources', '/change-password', '/intranet', '/chat', '/attendance',
];

export default function Header() {
    const t = useTranslations('Header');
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const segments = pathname.split('/');
    const isDashboardRoute = dashboardRoutes.some((route) =>
        segments.includes(route.replace('/', ''))
    );
    if (isDashboardRoute) return null;

    const navLinks = [
        { href: '/#about', label: t('about') },
        { href: '/#team', label: t('team') },
        { href: '/#projects', label: t('projects') },
        { href: '/#events', label: t('events') },
        { href: '/blog', label: t('blog') },
        { href: '/partners', label: t('partners') },
    ];

    const locale = pathname.startsWith('/fr') ? 'fr' : 'en';
    const switchLocale = (next: string) => {
        window.location.href = `/${next}${pathname.replace(/^\/(fr|en)/, '')}`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 border-b border-default bg-paper/95 backdrop-blur-sm supports-[backdrop-filter]:bg-paper/85">
            <div className="max-w-[1280px] mx-auto h-16 flex items-center justify-between gap-6">
                <Link href="/" className="flex items-center shrink-0 rounded-md" aria-label={t('home_label')}>
                    <BrandWordmark priority />
                </Link>

                <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="inline-flex items-center min-h-11 px-3 rounded-lg text-[15px] font-medium text-secondary hover:text-primary hover:bg-card-muted transition-colors duration-[160ms]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-2">
                    <ThemeToggle />
                    <div className="flex items-center rounded-lg border border-default p-0.5" role="group" aria-label={t('language')}>
                        {(['fr', 'en'] as const).map((code) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => code !== locale && switchLocale(code)}
                                aria-pressed={code === locale}
                                className={`min-h-9 min-w-9 px-2 rounded-md text-[13px] font-medium transition-colors duration-[160ms] ${
                                    code === locale ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'
                                }`}
                            >
                                {code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center min-h-11 px-3 rounded-lg text-[15px] font-medium text-secondary hover:text-primary transition-colors duration-[160ms]"
                    >
                        {t('sign_in')}
                    </Link>
                    <Link
                        href="/join"
                        className="inline-flex items-center min-h-11 px-5 rounded-full bg-brand-600 text-white text-[15px] font-medium hover:bg-brand-700 active:scale-[0.98] transition-[background-color,transform] duration-[180ms]"
                    >
                        {t('join')}
                    </Link>
                </div>

                <div className="lg:hidden flex items-center gap-1">
                    <ThemeToggle />
                    <button
                        type="button"
                        className="inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-primary hover:bg-card-muted"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-expanded={mobileOpen}
                        aria-label={mobileOpen ? t('menu_close') : t('menu_open')}
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="lg:hidden border-t border-default bg-paper overflow-hidden"
                        aria-label="Mobile"
                    >
                        <ul className="flex flex-col p-4 gap-1">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center min-h-11 px-3 rounded-lg text-[16px] font-medium text-primary hover:bg-card-muted"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="px-3 py-2">
                                <label htmlFor="mobile-locale" className="sr-only">{t('language')}</label>
                                <select
                                    id="mobile-locale"
                                    onChange={(e) => switchLocale(e.target.value)}
                                    defaultValue={locale}
                                    className="w-full min-h-11 bg-card text-primary border border-default rounded-lg px-3 text-[15px]"
                                >
                                    <option value="en">English</option>
                                    <option value="fr">Français</option>
                                </select>
                            </li>
                            <li className="grid grid-cols-2 gap-2 pt-2">
                                <Link
                                    href="/sign-in"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center min-h-11 rounded-lg border border-default bg-card text-primary font-medium"
                                >
                                    {t('sign_in')}
                                </Link>
                                <Link
                                    href="/join"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center min-h-11 rounded-full bg-brand-600 text-white font-medium"
                                >
                                    {t('join')}
                                </Link>
                            </li>
                        </ul>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
