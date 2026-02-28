"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, type Variants } from 'framer-motion';
import MathFormulas from '@/components/MathFormulas';

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
            className="flex flex-col justify-center min-h-screen relative overflow-hidden py-32"
        >
            {/* Formules mathématiques flottantes */}
            <MathFormulas />

            {/* Contenu aligné à gauche */}
            <motion.div
                className="max-w-[1400px] w-full mx-auto px-8 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Titre principal — énorme, bold, gauche */}
                <motion.h1
                    className="text-[clamp(2.2rem,5.5vw,4.2rem)] font-black leading-[1.1] mb-8 text-white tracking-tight"
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                    variants={itemVariants}
                >
                    {t('title')}
                </motion.h1>

                {/* Sous-titre — uppercase, gris, espacé */}
                <motion.p
                    className="text-[clamp(1rem,2.5vw,1.3rem)] text-gray-300 font-bold mb-6 tracking-[3px] uppercase"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                    variants={itemVariants}
                >
                    {t('subtitle')}
                </motion.p>

                {/* Description */}
                <motion.p
                    className="text-[clamp(1rem,2vw,1.2rem)] text-white/90 leading-relaxed max-w-[600px] mb-12 font-light"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
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
                            className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            }}
                            whileHover={{ y: -3, scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            {t('join_btn')}
                            <ArrowRight />
                        </motion.button>
                    </Link>

                    <Link href="/#projects">
                        <motion.span
                            className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white"
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.3)',
                            }}
                            whileHover={{ y: -3, scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.96 }}
                        >
                            {t('projects_btn')}
                        </motion.span>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}
