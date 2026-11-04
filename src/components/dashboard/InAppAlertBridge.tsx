'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';
import { setAppBadgeCount, showClientNotification } from '@/lib/push/client-notify';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';

/**
 * Quand le total de notifications in-app augmente (forum, événement…),
 * signale aussi via une notification OS si l'onglet n'est pas au premier plan.
 */
export default function InAppAlertBridge({ enabled }: { enabled: boolean }) {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { counts } = useNotificationCounts(enabled);
  const { total: chatUnread } = useChatUnreadCount(enabled);
  const prevTotal = useRef<number | null>(null);
  const primed = useRef(false);

  useEffect(() => {
    const badge = counts.total + chatUnread;
    setAppBadgeCount(badge);
  }, [counts.total, chatUnread]);

  useEffect(() => {
    if (!enabled) return;

    if (!primed.current) {
      primed.current = true;
      prevTotal.current = counts.total;
      return;
    }

    const prev = prevTotal.current ?? 0;
    prevTotal.current = counts.total;
    if (counts.total <= prev) return;
    if (!document.hidden) return;

    void (async () => {
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' });
        if (!res.ok) {
          await showClientNotification({
            title: "Epi'AI",
            body: 'Nouvelle notification',
            url: `/${locale}/dashboard`,
            tag: 'epiai-notif',
            force: true,
          });
          return;
        }
        const data = (await res.json()) as {
          notifications?: Array<{ title?: string; message?: string; link?: string; type?: string }>;
        };
        const latest = Array.isArray(data.notifications) ? data.notifications[0] : undefined;
        const link = latest?.link
          ? latest.link.startsWith('/')
            ? `/${locale}${latest.link}`
            : latest.link
          : `/${locale}/dashboard`;
        await showClientNotification({
          title: latest?.title || "Epi'AI",
          body: latest?.message || 'Nouvelle notification',
          url: link,
          tag: `notif-${latest?.type || 'system'}`,
          force: true,
        });
      } catch {
        /* ignore */
      }
    })();
  }, [counts.total, enabled, locale]);

  return null;
}
