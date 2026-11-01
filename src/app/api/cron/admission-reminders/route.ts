import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExamPassword, hashPassword } from '@/lib/admission/crypto';
import { sendExamCredentialsEmail } from '@/lib/admission/emails';
import { examWindow } from '@/lib/admission/time';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const bookings = await prisma.examBooking.findMany({
    where: { credentialsSentAt: null },
    include: {
      slot: { include: { exam: true } },
      application: true,
    },
  });

  let sent = 0;
  for (const booking of bookings) {
    const { openAt, closeAt } = examWindow(booking.slot.startsAt, booking.slot.exam.durationMinutes);
    if (now < openAt.getTime() || now > closeAt.getTime()) continue;
    const password = generateExamPassword();
    await prisma.examBooking.update({
      where: { id: booking.id },
      data: { examPasswordHash: hashPassword(password), credentialsSentAt: new Date() },
    });
    try {
      await sendExamCredentialsEmail({
        email: booking.application.email,
        firstName: booking.application.firstName,
        login: booking.examLogin,
        password,
        when: booking.slot.startsAt,
        examTitle: booking.slot.exam.title,
      });
      sent++;
    } catch (err) {
      logger.warn('Exam credentials email failed', { bookingId: booking.id, err: String(err) });
    }
  }

  logger.info('Admission reminders cron completed', { sent, scanned: bookings.length });
  return NextResponse.json({ sent, scanned: bookings.length });
}
