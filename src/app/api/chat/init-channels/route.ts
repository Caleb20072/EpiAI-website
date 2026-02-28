import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StreamChat } from 'stream-chat';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

const CHANNELS = [
    { id: 'general', name: '💬 Général' },
    { id: 'ai-discussion', name: '🧠 Intelligence Artificielle' },
    { id: 'web-dev', name: '🌐 Web & Mobile' },
    { id: 'data', name: '📊 Data Science' },
    { id: 'projets', name: '🚀 Projets' },
    { id: 'annonces', name: '📢 Annonces' },
];

/**
 * POST /api/chat/init-channels
 * Initialise les canaux Stream Chat
 */
export async function POST() {
    try {
        if (!apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Stream Chat not configured' }, { status: 503 });
        }

        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const serverClient = StreamChat.getInstance(apiKey, apiSecret);

        // Ensure system user exists
        await serverClient.upsertUser({ id: 'system', role: 'admin' });

        // Create each channel
        const results = await Promise.allSettled(
            CHANNELS.map(async (ch) => {
                const channel = serverClient.channel('messaging', ch.id, {
                    created_by_id: 'system',
                });
                await channel.create();
                return ch.id;
            })
        );

        const created = results
            .filter((r) => r.status === 'fulfilled')
            .map((r) => (r as PromiseFulfilledResult<string>).value);

        return NextResponse.json({ success: true, channels: created });
    } catch (error: any) {
        console.error('[init-channels] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
