'use client';

import { StreamChat, type Event } from 'stream-chat';
import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { useParams } from 'next/navigation';
import {
    BarChart3,
    FolderKanban,
    Globe2,
    Megaphone,
    MessageCircle,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CHAT_CHANNELS } from '@/lib/chat/channels';
import { showClientNotification } from '@/lib/push/client-notify';
import { UnreadBadge } from './UnreadBadge';

interface ChannelDef {
    id: string;
    label: string;
    Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    description: string;
}

const CHANNEL_UI: ChannelDef[] = [
    { id: 'general', label: 'Général', Icon: MessageCircle, description: 'Canal principal' },
    { id: 'ai-discussion', label: 'Intelligence Artificielle', Icon: Sparkles, description: 'IA & ML' },
    { id: 'web-dev', label: 'Web & Mobile', Icon: Globe2, description: 'Dev web et mobile' },
    { id: 'data', label: 'Data Science', Icon: BarChart3, description: 'Data & analyse' },
    { id: 'projets', label: 'Projets', Icon: FolderKanban, description: 'Projets asso' },
    { id: 'annonces', label: 'Annonces', Icon: Megaphone, description: 'Annonces officielles' },
];

interface ChannelSidebarProps {
    client: StreamChat;
    userId: string;
    activeChannelId: string;
    onChannelSelect: (id: string) => void;
    className?: string;
}

export function ChannelSidebar({ client, userId, activeChannelId, onChannelSelect, className }: ChannelSidebarProps) {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const syncUnread = useCallback((channels: Awaited<ReturnType<StreamChat['queryChannels']>>) => {
        const counts: Record<string, number> = {};
        channels.forEach((ch) => {
            if (ch.id) counts[ch.id] = ch.countUnread();
        });
        setUnreadCounts(counts);
    }, []);

    useEffect(() => {
        let mounted = true;
        let watchedChannels: Awaited<ReturnType<StreamChat['queryChannels']>> = [];

        async function watchChannels() {
            try {
                const channels = await client.queryChannels(
                    {
                        type: 'messaging',
                        id: { $in: CHAT_CHANNELS.map((c) => c.id) },
                        members: { $in: [userId] },
                    },
                    { last_message_at: -1 },
                    { watch: true, state: true }
                );

                if (!mounted) return;
                watchedChannels = channels;
                syncUnread(channels);
            } catch {
                // Canaux pas encore prêts
            }
        }

        const handleUpdate = () => {
            if (watchedChannels.length) syncUnread(watchedChannels);
            window.dispatchEvent(new CustomEvent('chat-unread-changed'));
        };

        const handleIncoming = (event: Event) => {
            handleUpdate();
            const msg = event.message;
            const senderId = msg?.user?.id;
            if (!senderId || senderId === userId || senderId === 'system') return;

            const channelId =
                event.channel_id ||
                (typeof event.cid === 'string' ? event.cid.split(':')[1] : undefined) ||
                '';
            if (!channelId) return;

            // Canal ouvert et onglet visible → pas de notif OS
            if (!document.hidden && channelId === activeChannelId) return;

            const channelMeta = CHANNEL_UI.find((c) => c.id === channelId);
            const text = (msg?.text || '').trim();
            if (!text) return;
            const preview = text.length > 120 ? `${text.slice(0, 117)}…` : text;
            const senderName = msg?.user?.name || 'Un membre';

            void showClientNotification({
                title: `Nouveau message — ${channelMeta?.label || channelId}`,
                body: `${senderName} : ${preview}`,
                url: `/${locale}/chat?channel=${encodeURIComponent(channelId)}`,
                tag: `chat-${channelId}`,
                force: true,
            });
        };

        watchChannels();

        client.on('message.new', handleIncoming);
        client.on('message.read', handleUpdate);
        client.on('notification.message_new', handleIncoming);
        client.on('notification.mark_read', handleUpdate);
        client.on('notification.mark_unread', handleUpdate);

        return () => {
            mounted = false;
            client.off('message.new', handleIncoming);
            client.off('message.read', handleUpdate);
            client.off('notification.message_new', handleIncoming);
            client.off('notification.mark_read', handleUpdate);
            client.off('notification.mark_unread', handleUpdate);
        };
    }, [client, userId, syncUnread, activeChannelId, locale]);

    return (
        <div className={cn('w-64 max-w-[85vw] shrink-0 border-r border-default bg-surface lg:bg-black/30 flex flex-col h-full', className)}>
            <div className="p-4 border-b border-default">
                <h2 className="text-primary font-semibold text-sm uppercase tracking-wider opacity-60">
                    Canaux
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                {CHANNEL_UI.map((ch) => {
                    const isActive = activeChannelId === ch.id;
                    const unread = unreadCounts[ch.id] || 0;
                    const { Icon } = ch;

                    return (
                        <button
                            key={ch.id}
                            onClick={() => onChannelSelect(ch.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
                                isActive
                                    ? 'bg-card-muted text-primary'
                                    : unread > 0
                                      ? 'text-white/90 bg-white/[0.03] hover:bg-card'
                                      : 'text-muted hover:bg-card hover:text-secondary'
                            )}
                        >
                            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-default bg-card">
                                <Icon className="h-4 w-4 text-brand-700" strokeWidth={1.5} />
                                {unread > 0 && isActive ? (
                                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-surface" />
                                ) : null}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={cn(
                                    'truncate text-sm font-medium',
                                    unread > 0 && !isActive ? 'font-semibold text-primary' : isActive ? 'text-primary' : ''
                                )}>
                                    {ch.label}
                                </p>
                            </div>
                            <UnreadBadge count={unread} />
                        </button>
                    );
                })}
            </div>

            <div className="p-3 border-t border-default">
                <p className="text-muted text-xs text-center">Epi&apos;AI Chat • Temps réel</p>
            </div>
        </div>
    );
}
