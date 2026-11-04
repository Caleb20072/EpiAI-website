'use client';

import { useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { StreamChat, type Event } from 'stream-chat';
import { CHAT_CHANNELS } from '@/lib/chat/channels';
import { setAppBadgeCount, showClientNotification } from '@/lib/push/client-notify';

function activeChannelFromUrl(): string {
  try {
    return new URL(window.location.href).searchParams.get('channel') || 'general';
  } catch {
    return 'general';
  }
}

/**
 * Connexion Stream légère hors page chat : vraie notification OS
 * dès qu'un message arrive (secours si le webhook serveur est absent).
 * Sur /chat, ChatPage gère déjà le WebSocket — on ne double pas ici.
 */
export default function ChatLiveAlerts({ enabled }: { enabled: boolean }) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'fr';
  const onChatPage = (pathname || '').includes('/chat');
  const active = enabled && !onChatPage;

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let client: StreamChat | null = null;
    let ownedConnection = false;

    async function connect() {
      try {
        const res = await fetch('/api/chat/token', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          token: string;
          userId: string;
          name: string;
          imageUrl?: string;
          apiKey: string;
        };

        client = StreamChat.getInstance(data.apiKey);
        if (!client.userID) {
          await client.connectUser(
            { id: data.userId, name: data.name, image: data.imageUrl },
            data.token,
          );
          ownedConnection = true;
        }
        if (cancelled) return;

        const channels = await client.queryChannels(
          {
            type: 'messaging',
            id: { $in: CHAT_CHANNELS.map((c) => c.id) },
            members: { $in: [data.userId] },
          },
          { last_message_at: -1 },
          { watch: true, state: true, presence: false },
        );
        if (cancelled) return;

        const updateBadge = () => {
          const total = channels.reduce((sum, ch) => sum + ch.countUnread(), 0);
          setAppBadgeCount(total);
          window.dispatchEvent(new CustomEvent('chat-unread-changed'));
        };
        updateBadge();

        const onMessage = (event: Event) => {
          const msg = event.message;
          const senderId = msg?.user?.id;
          if (!senderId || senderId === data.userId || senderId === 'system') return;

          const channelId =
            event.channel_id ||
            (typeof event.cid === 'string' ? event.cid.split(':')[1] : undefined) ||
            '';
          if (!channelId) return;

          const onChat = (pathnameRef.current || '').includes('/chat');
          const viewingThis =
            onChat && !document.hidden && activeChannelFromUrl() === channelId;
          if (viewingThis) {
            updateBadge();
            return;
          }

          const channelMeta = CHAT_CHANNELS.find((c) => c.id === channelId);
          const channelName = channelMeta?.name || channelId;
          const senderName = msg?.user?.name || 'Un membre';
          const text = (msg?.text || '').trim();
          if (!text) {
            updateBadge();
            return;
          }
          const preview = text.length > 120 ? `${text.slice(0, 117)}…` : text;

          void showClientNotification({
            title: `Nouveau message — ${channelName}`,
            body: `${senderName} : ${preview}`,
            url: `/${locale}/chat?channel=${encodeURIComponent(channelId)}`,
            tag: `chat-${channelId}`,
            force: true,
          });
          updateBadge();
        };

        client.on('message.new', onMessage);
        client.on('notification.message_new', onMessage);
        client.on('message.read', updateBadge);
        client.on('notification.mark_read', updateBadge);

        return () => {
          client?.off('message.new', onMessage);
          client?.off('notification.message_new', onMessage);
          client?.off('message.read', updateBadge);
          client?.off('notification.mark_read', updateBadge);
        };
      } catch {
        // Stream optional
      }
    }

    let cleanup: (() => void) | undefined;
    void connect().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cancelled = true;
      cleanup?.();
      if (ownedConnection && client) {
        void client.disconnectUser().catch(() => undefined);
      }
    };
  }, [active, locale]);

  return null;
}
