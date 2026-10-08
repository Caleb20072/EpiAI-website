"use client";

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, type Variants } from 'framer-motion';

const ArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
};

export default function HeroSection() {
    const t = useTranslations('HomePage');

    return (
        <section
            id="home"
            className="flex flex-col justify-center min-h-[100svh] relative overflow-hidden pt-11 text-white"
        >
            <Image
                src="/assets/hero-bg.jpg"
                alt=""
                fill
                priority
                className="object-cover -z-10"
            />
            <div className="absolute inset-0 -z-10 bg-black/45" />

            {/* Contenu aligné à gauche */}
            <motion.div
                className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Titre principal — énorme, bold, gauche */}
                <motion.h1
                    className="display max-w-[14ch] mb-4 text-white"
                    variants={itemVariants}
                >
                    {t('title')}
                </motion.h1>

                {/* Sous-titre — uppercase, gris, espacé */}
                <motion.p
                    className="text-[21px] font-semibold leading-[1.19] text-white mb-4"
                    variants={itemVariants}
                >
                    {t('subtitle')}
                </motion.p>

                {/* Description */}
                <motion.p
                    className="text-[17px] text-white/90 leading-[1.47] max-w-[36rem] mb-10 font-normal"
                    variants={itemVariants}
                >
                    {t('description')}
                </motion.p>

                {/* Boutons */}
                <motion.div
                    className="flex flex-wrap gap-6 items-center"
                    variants={itemVariants}
                >
                    <Link href="/join">
                        <motion.button
                            className="flex items-center gap-2 min-h-11 px-7 rounded-full font-light text-[18px] text-white bg-[#0066cc]"
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('join_btn')}
                            <ArrowRight />
                        </motion.button>
                    </Link>

                    <Link href="/#projects">
                        <motion.span
                            className="flex items-center gap-2 min-h-11 px-7 rounded-full font-normal text-[17px] text-[#2997ff]"
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('projects_btn')}
                        </motion.span>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}
