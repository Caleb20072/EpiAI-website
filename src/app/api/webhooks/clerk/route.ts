import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { upsertUserFromClerk, deleteUserByClerkId } from '@/lib/users/repository';
import type { UserWebhookPayload } from '@/lib/webhooks/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: UserWebhookPayload;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as UserWebhookPayload;
    } catch {
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
    }

    switch (evt.type) {
      case 'user.created':
      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
        await upsertUserFromClerk({
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          role: (public_metadata?.role as string) || 'membre',
          roleLevel: Number(public_metadata?.roleId) || 1,
        });
        break;
      }
      case 'user.deleted': {
        await deleteUserByClerkId(evt.data.id);
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Webhook error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
