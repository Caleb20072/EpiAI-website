'use client';

import { StreamChat } from 'stream-chat';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CHAT_CHANNELS } from '@/lib/chat/channels';
import { UnreadBadge } from './UnreadBadge';

interface ChannelDef {
    id: string;
    label: string;
    icon: string;
    description: string;
}

const CHANNEL_UI: ChannelDef[] = [
    { id: 'general', label: 'Général', icon: '💬', description: 'Canal principal' },
    { id: 'ai-discussion', label: 'Intelligence Artificielle', icon: '🧠', description: 'IA & ML' },
    { id: 'web-dev', label: 'Web & Mobile', icon: '🌐', description: 'Dev web et mobile' },
    { id: 'data', label: 'Data Science', icon: '📊', description: 'Data & analyse' },
    { id: 'projets', label: 'Projets', icon: '🚀', description: 'Projets asso' },
    { id: 'annonces', label: 'Annonces', icon: '📢', description: 'Annonces officielles' },
];

interface ChannelSidebarProps {
    client: StreamChat;
    userId: string;
    activeChannelId: string;
    onChannelSelect: (id: string) => void;
    className?: string;
}

export function ChannelSidebar({ client, userId, activeChannelId, onChannelSelect, className }: ChannelSidebarProps) {
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

        watchChannels();

        client.on('message.new', handleUpdate);
        client.on('message.read', handleUpdate);
        client.on('notification.message_new', handleUpdate);
        client.on('notification.mark_read', handleUpdate);
        client.on('notification.mark_unread', handleUpdate);

        return () => {
            mounted = false;
            client.off('message.new', handleUpdate);
            client.off('message.read', handleUpdate);
            client.off('notification.message_new', handleUpdate);
            client.off('notification.mark_read', handleUpdate);
            client.off('notification.mark_unread', handleUpdate);
        };
    }, [client, userId, syncUnread]);

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
                            <span className="text-lg shrink-0 relative">
                                {ch.icon}
                                {unread > 0 && isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-zinc-900" />
                                )}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-sm font-medium truncate',
                                    unread > 0 && !isActive ? 'text-primary font-semibold' : isActive ? 'text-primary' : ''
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
