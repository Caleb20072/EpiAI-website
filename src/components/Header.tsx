"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const dashboardRoutes = [
    '/dashboard', '/admin', '/profile', '/settings',
    '/resources', '/forum', '/events', '/my-registrations',
    '/my-resources', '/change-password',
];

export default function Header() {
    const t = useTranslations('Header');
    const pathname = usePathname();

    const isDashboardRoute = dashboardRoutes.some((route) => pathname.includes(route));
    if (isDashboardRoute) return null;

    const navLinks = [
        { href: '/#about', label: t('about') },
        { href: '/#team', label: t('team') },
        { href: '/blog', label: t('blog') },
        { href: '/#projects', label: t('projects') },
    ];

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between">

                {/* Logo */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/" className="flex items-center">
                        <div className="relative w-14 h-14 overflow-hidden rounded-full"
                            style={{
                                border: '3px solid rgba(255,255,255,0.2)',
                                padding: '3px',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                            }}
                        >
                            <Image
                                src="/assets/logo.jpg"
                                alt="EPI'AI Logo"
                                fill
                                className="object-cover rounded-full"
                                sizes="56px"
                            />
                        </div>
                    </Link>
                </motion.div>

                {/* Navigation — à droite */}
                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href.replace('/#', '/'));
                        return (
                            <motion.div
                                key={link.href}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Link
                                    href={link.href}
                                    className="relative text-white/80 hover:text-white transition-colors font-medium text-sm group"
                                    style={isActive ? { color: 'white' } : {}}
                                >
                                    {link.label}
                                    <span
                                        className="absolute bottom-[-2px] left-0 h-[2px] bg-white transition-all duration-300 ease-in-out"
                                        style={{ width: isActive ? '100%' : '0', }}
                                    />
                                    <span className="absolute bottom-[-2px] left-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-300 ease-in-out" />
                                </Link>
                            </motion.div>
                        );
                    })}

                    {/* Sélecteur de langue */}
                    <select
                        onChange={(e) => {
                            const nextLocale = e.target.value;
                            window.location.href = `/${nextLocale}${pathname.replace(/^\/(fr|en)/, '')}`;
                        }}
                        defaultValue={pathname.startsWith('/fr') ? 'fr' : 'en'}
                        className="bg-transparent text-white/80 border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:bg-black/30 cursor-pointer"
                    >
                        <option value="en" className="text-black">EN</option>
                        <option value="fr" className="text-black">FR</option>
                    </select>

                    {/* Bouton Se connecter */}
                    <Link href="/sign-in">
                        <motion.button
                            className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)',
                            }}
                            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.25)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('sign_in')}
                        </motion.button>
                    </Link>
                </nav>
            </div>
        </motion.header>
    );
}
