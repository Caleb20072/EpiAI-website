import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EXAM_COOKIE, readExamSession } from '@/lib/admission/crypto';
import { examWindow } from '@/lib/admission/time';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(EXAM_COOKIE)?.value;
  const payload = readExamSession(token);
  if (!payload) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: payload.attemptId },
    include: { booking: { include: { slot: { include: { exam: true } } } } },
  });
  if (!attempt) return NextResponse.json({ error: 'Session invalide.' }, { status: 401 });

  const exam = attempt.booking.slot.exam;
  const { closeAt } = examWindow(attempt.booking.slot.startsAt, exam.durationMinutes);
  const started = Date.now() >= attempt.booking.slot.startsAt.getTime();
  if (!started || Date.now() > closeAt.getTime() + 5 * 60 * 1000 || attempt.submittedAt) {
    return NextResponse.json({ error: 'Sujet indisponible.' }, { status: 403 });
  }
  if (!exam.examPdfBytes) {
    return NextResponse.json({ error: 'Pas de PDF sujet.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(exam.examPdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${(exam.examPdfName || 'sujet.pdf').replace(/"/g, '')}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
