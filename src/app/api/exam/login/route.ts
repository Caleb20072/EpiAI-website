import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EXAM_COOKIE, signExamSession, verifyPassword } from '@/lib/admission/crypto';
import { examWindow } from '@/lib/admission/time';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { login?: string; password?: string };
  const login = body.login?.trim() || '';
  const password = body.password || '';
  if (!login || !password) {
    return NextResponse.json({ error: 'Identifiant et mot de passe requis.' }, { status: 400 });
  }

  const booking = await prisma.examBooking.findUnique({
    where: { examLogin: login },
    include: {
      slot: { include: { exam: { include: { questions: { orderBy: { sortOrder: 'asc' } } } } } },
      application: true,
      attempt: true,
    },
  });
  if (!booking || !booking.examPasswordHash || !verifyPassword(password, booking.examPasswordHash)) {
    return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
  }

  const { openAt, closeAt } = examWindow(booking.slot.startsAt, booking.slot.exam.durationMinutes);
  const now = Date.now();
  if (now < openAt.getTime()) {
    return NextResponse.json(
      { error: 'La salle n’est pas encore ouverte. Reviens 10 minutes avant le début.' },
      { status: 403 },
    );
  }
  if (now > closeAt.getTime()) {
    return NextResponse.json({ error: 'Ce créneau est terminé.' }, { status: 403 });
  }

  let attempt = booking.attempt;
  if (!attempt) {
    const maxScore = booking.slot.exam.questions.reduce((sum, q) => sum + q.points, 0);
    attempt = await prisma.examAttempt.create({
      data: {
        bookingId: booking.id,
        applicationId: booking.applicationId,
        examId: booking.slot.examId,
        maxScore,
      },
    });
    await prisma.examAnswer.createMany({
      data: booking.slot.exam.questions.map((q) => ({
        attemptId: attempt!.id,
        questionId: q.id,
        response: '',
      })),
    });
  }

  const token = signExamSession({
    bookingId: booking.id,
    attemptId: attempt.id,
    exp: closeAt.getTime() + 30 * 60 * 1000,
  });

  const res = NextResponse.json({ ok: true, startsAt: booking.slot.startsAt.toISOString() });
  res.cookies.set(EXAM_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(closeAt.getTime() + 30 * 60 * 1000),
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
