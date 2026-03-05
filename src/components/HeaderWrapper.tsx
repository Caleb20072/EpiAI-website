import { headers } from 'next/headers';
import Header from './Header';

const DASHBOARD_SEGMENTS = [
    'dashboard', 'admin', 'profile', 'settings',
    'resources', 'forum', 'events', 'my-registrations',
    'my-resources', 'change-password', 'intranet',
];

/**
 * Server component that reads the current pathname via Next.js request headers.
 * This avoids the client-side hydration flash where the Header briefly appears
 * on dashboard routes before usePathname() resolves on the client.
 */
export default async function HeaderWrapper() {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? '';

    const segments = pathname.split('/');
    const isDashboard = DASHBOARD_SEGMENTS.some((seg) => segments.includes(seg));

    if (isDashboard) return null;

    return <Header />;
}
