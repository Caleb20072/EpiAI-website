import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyUserByDbId } from '@/lib/notifications/service';
import { sendEventReminderEmail } from '@/lib/email/resend';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        date: { gte: tomorrowStart, lte: tomorrowEnd },
      },
    });

    let notified = 0;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://epiai.eu';

    for (const event of events) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { eventId: event.id, status: 'registered' },
      });

      for (const reg of registrations) {
        const user = await prisma.user.findUnique({ where: { clerkId: reg.userId } });
        if (!user) continue;

        await notifyUserByDbId({
          userId: user.id,
          type: 'event',
          title: 'Rappel événement demain',
          message: event.title,
          link: `/events/${event.id}`,
        });

        const dateStr = event.date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
        sendEventReminderEmail(
          user.email,
          user.firstName || 'Membre',
          event.title,
          dateStr,
          `${siteUrl}/fr/events/${event.id}`
        ).catch(() => {});

        notified++;
      }
    }

    logger.info('Event reminders cron completed', { events: events.length, notified });
    return NextResponse.json({ events: events.length, notified });
  } catch (error) {
    logger.error('Event reminders cron failed', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
