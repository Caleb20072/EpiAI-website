'use client';

import { useEffect, useState } from 'react';
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
    useCreateChatClient,
} from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import { ChannelSidebar } from './ChannelSidebar';
import { Loader2 } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import '@/styles/stream-chat-custom.css';

interface TokenData {
    token: string;
    userId: string;
    name: string;
    imageUrl?: string;
    apiKey: string;
}

/**
 * Inner component — only rendered when we have a guaranteed valid userId.
 * Waits for the Stream WS connection to be established before calling channel.watch().
 */
function ChatClient({ tokenData }: { tokenData: TokenData }) {
    const [activeChannelId, setActiveChannelId] = useState<string>('general');
    const [activeChannel, setActiveChannel] = useState<StreamChannel | undefined>();
    const [connected, setConnected] = useState(false);

    const client = useCreateChatClient({
        apiKey: tokenData.apiKey,
        tokenOrProvider: tokenData.token,
        userData: {
            id: tokenData.userId,
            name: tokenData.name,
            image: tokenData.imageUrl,
        },
    });

    // Wait for WebSocket connection before doing anything
    useEffect(() => {
        if (!client) return;

        const checkConnected = () => {
            // Stream stores connection status on the client
            if ((client as any).wsConnection?.isConnected?.() || client.userID) {
                setConnected(true);
            }
        };

        // Check immediately (may already be connected)
        checkConnected();

        // Listen for connection events
        const handler = client.on('connection.changed', (event: any) => {
            if (event.online) setConnected(true);
        });

        // Also listen for user connected
        const userHandler = client.on('health.check', () => {
            setConnected(true);
        });

        return () => {
            handler.unsubscribe?.();
            userHandler.unsubscribe?.();
        };
    }, [client]);

    // Watch the active channel only after WS is connected
    useEffect(() => {
        if (!client || !connected) return;

        let cancelled = false;
        const ch = client.channel('messaging', activeChannelId);

        ch.watch()
            .then(() => {
                if (!cancelled) setActiveChannel(ch);
            })
            .catch((err: Error) => {
                console.error('[ChatClient] channel.watch error:', err.message);
            });

        return () => {
            cancelled = true;
        };
    }, [client, connected, activeChannelId]);

    if (!client || !connected) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                    <p className="text-white/30 text-xs">Connexion WebSocket...</p>
                </div>
            </div>
        );
    }

    return (
        <Chat client={client} theme="str-chat__theme-dark">
            <div className="flex h-full">
                <ChannelSidebar
                    client={client}
                    userId={tokenData.userId}
                    activeChannelId={activeChannelId}
                    onChannelSelect={setActiveChannelId}
                />
                <div className="flex-1 overflow-hidden">
                    <Channel channel={activeChannel}>
                        <Window>
                            <ChannelHeader />
                            <MessageList />
                            <MessageInput focus />
                        </Window>
                        <Thread />
                    </Channel>
                </div>
            </div>
        </Chat>
    );
}

/**
 * Outer component — fetches the Stream token, then mounts ChatClient
 * only when we have a valid non-empty userId.
 */
export function ChatPage() {
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchToken() {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);

                const res = await fetch('/api/chat/token', { signal: controller.signal });
                clearTimeout(timeout);

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to get chat token');
                }

                const data: TokenData = await res.json();

                if (!data.userId) {
                    throw new Error('Invalid token response: missing userId');
                }

                if (!cancelled) setTokenData(data);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.name === 'AbortError'
                        ? 'Serveur trop lent. Réessaie dans quelques secondes.'
                        : err.message
                    );
                }
            }
        }

        fetchToken();
        return () => { cancelled = true; };
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Chat non disponible</h2>
                <p className="text-white/60 max-w-md text-sm mb-4">{error}</p>
                <button
                    onClick={() => { setError(null); setTokenData(null); }}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!tokenData) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    <p className="text-white/40 text-sm">Connexion au chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-wrapper h-[calc(100vh-140px)] min-h-[500px] rounded-2xl overflow-hidden border border-white/10">
            <ChatClient tokenData={tokenData} />
        </div>
    );
}
