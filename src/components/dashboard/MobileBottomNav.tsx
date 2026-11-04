'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FolderOpen,
  MessagesSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';

type NavItem = {
  href: string;
  icon: typeof LayoutDashboard;
  labelFr: string;
  labelEn: string;
  seg: string;
};

const items: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, labelFr: 'Accueil', labelEn: 'Home', seg: 'dashboard' },
  { href: '/resources', icon: FolderOpen, labelFr: 'Ressources', labelEn: 'Resources', seg: 'resources' },
  { href: '/forum', icon: MessageSquare, labelFr: 'Forum', labelEn: 'Forum', seg: 'forum' },
  { href: '/chat', icon: MessagesSquare, labelFr: 'Chat', labelEn: 'Chat', seg: 'chat' },
  { href: '/events', icon: Calendar, labelFr: 'Talks', labelEn: 'Talks', seg: 'events' },
];

export default function MobileBottomNav() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'fr';
  const { total: chatUnread } = useChatUnreadCount(true);
  const { counts: notifCounts } = useNotificationCounts(true);

  const badgeFor = (seg: string) => {
    if (seg === 'dashboard') return notifCounts.total + chatUnread;
    if (seg === 'forum') return notifCounts.forum;
    if (seg === 'chat') return chatUnread;
    if (seg === 'events') return notifCounts.event;
    return 0;
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-[200] w-full max-w-[100vw] bg-surface/95 backdrop-blur-sm border-t border-default pb-[env(safe-area-inset-bottom,0px)]"
      aria-label={locale === 'fr' ? 'Navigation principale' : 'Main navigation'}
    >
      <ul className="flex w-full items-stretch justify-between px-0.5">
        {items.map(({ href, icon: Icon, labelFr, labelEn, seg }) => {
          const active = pathname.includes(`/${seg}`);
          const badge = badgeFor(seg);
          const label = locale === 'fr' ? labelFr : labelEn;
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={`/${locale}${href}`}
                className={cn(
                  'relative flex h-full min-h-[52px] w-full flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight transition-colors duration-[160ms] sm:text-[11px]',
                  active
                    ? 'text-brand-700 before:absolute before:top-0 before:inset-x-2 before:h-0.5 before:rounded-full before:bg-brand-600'
                    : badge > 0
                      ? 'text-secondary'
                      : 'text-muted',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative shrink-0">
                  <Icon className="h-5 w-5" aria-hidden />
                  {badge > 0 ? (
                    <UnreadBadge
                      count={badge}
                      className="absolute -right-2 -top-1.5 h-4 min-w-[16px] text-[9px]"
                    />
                  ) : null}
                </span>
                <span className="max-w-full truncate px-0.5 text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
