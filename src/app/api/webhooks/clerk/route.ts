import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import type { UserWebhookPayload } from '@/lib/webhooks/types';

// Disable body parsing for raw body access
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not defined');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing Svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const body = await req.text();

    // Create Svix instance with secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: UserWebhookPayload;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as UserWebhookPayload;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 400 }
      );
    }

    const eventType = evt.type;

    // Handle the event
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

        console.log(`Processing user.created event for user ${id}`);

        // Connect to database
        const { db } = await connectToDatabase();

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ clerkId: id });

        if (!existingUser) {
          // Create user in MongoDB
          await db.collection('users').insertOne({
            clerkId: id,
            email: email_addresses[0]?.email_address || '',
            firstName: first_name || '',
            lastName: last_name || '',
            roleId: (public_metadata?.roleId as number) || 1,
            role: (public_metadata?.role as string) || 'membre',
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`User ${id} created in MongoDB`);
        }

        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

        console.log(`Processing user.updated event for user ${id}`);

        const { db } = await connectToDatabase();

        await db.collection('users').updateOne(
          { clerkId: id },
          {
            $set: {
              email: email_addresses[0]?.email_address || '',
              firstName: first_name || '',
              lastName: last_name || '',
              roleId: (public_metadata?.roleId as number) || 1,
              role: (public_metadata?.role as string) || 'membre',
              updatedAt: new Date(),
            },
          }
        );

        console.log(`User ${id} updated in MongoDB`);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        console.log(`Processing user.deleted event for user ${id}`);

        const { db } = await connectToDatabase();

        await db.collection('users').deleteOne({ clerkId: id });

        console.log(`User ${id} deleted from MongoDB`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
