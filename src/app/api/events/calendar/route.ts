import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 100,
    });

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EpiAI//Events//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Epi\'AI Events',
    ];

    for (const e of events) {
      const start = e.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = (e.endDate || new Date(e.date.getTime() + 2 * 60 * 60 * 1000))
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z';

      lines.push(
        'BEGIN:VEVENT',
        `UID:${e.id}@epiai.eu`,
        `DTSTAMP:${start}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${e.title.replace(/,/g, '\\,')}`,
        `DESCRIPTION:${e.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
        `LOCATION:${e.location.replace(/,/g, '\\,')}`,
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');

    return new NextResponse(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="epiai-events.ics"',
      },
    });
  } catch (error) {
    console.error('[API] Calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
