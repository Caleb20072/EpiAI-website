import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { StreamChat } from 'stream-chat';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

/**
 * GET /api/chat/token
 * Génère un token Stream Chat pour l'utilisateur Clerk connecté.
 * Utilise les sessionClaims d'abord pour éviter un appel réseau Clerk (rapide).
 */
export async function GET() {
    try {
        if (!apiKey || !apiSecret) {
            return NextResponse.json(
                { error: 'Stream Chat not configured. Add NEXT_PUBLIC_STREAM_API_KEY and STREAM_API_SECRET to .env.local' },
                { status: 503 }
            );
        }

        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Essayer les claims de session (instantané, pas d'appel réseau)
        let name = 'User';
        let imageUrl: string | undefined;

        const claimsAny = sessionClaims as Record<string, unknown> | null;
        if (claimsAny?.firstName || claimsAny?.lastName) {
            name = `${claimsAny?.firstName || ''} ${claimsAny?.lastName || ''}`.trim() || 'User';
        } else {
            // 2. Fallback : appel Clerk API (si les claims ne contiennent pas le nom)
            try {
                const client = await clerkClient();
                const user = await client.users.getUser(userId);
                name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
                imageUrl = user.imageUrl || undefined;
            } catch (clerkErr) {
                console.warn('[chat/token] Clerk API unavailable, using defaults');
            }
        }

        // 3. Générer le token Stream (opération locale, très rapide)
        const serverClient = StreamChat.getInstance(apiKey, apiSecret);
        const token = serverClient.createToken(userId);

        // 4. Upsert asynchrone — ne bloque pas la réponse
        serverClient.upsertUser({
            id: userId,
            name,
            image: imageUrl,
            role: 'user',
        }).catch((e: Error) => console.warn('[chat/token] upsertUser failed:', e.message));

        return NextResponse.json({ token, userId, name, imageUrl, apiKey });
    } catch (error: any) {
        console.error('[chat/token] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate token' },
            { status: 500 }
        );
    }
}
