import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root: import.meta.dirname,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        qualities: [75, 100],
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: '/push-sw.js',
                headers: [
                    { key: 'Service-Worker-Allowed', value: '/' },
                    { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                    { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
