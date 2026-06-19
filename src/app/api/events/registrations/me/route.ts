import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserRegistrations } from '@/lib/events/repository';
import { getEventById } from '@/lib/events/repository';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registrations = await getUserRegistrations(userId);

    const enriched = await Promise.all(
      registrations.map(async (reg) => {
        const event = await getEventById(reg.eventId);
        return {
          id: reg.id,
          eventId: reg.eventId,
          eventTitle: event?.title ?? 'Event',
          eventDate: event?.date ?? reg.registeredAt,
          eventLocation: event?.location ?? '',
          status: reg.status,
          registeredAt: reg.registeredAt,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('[API] Error fetching user registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
