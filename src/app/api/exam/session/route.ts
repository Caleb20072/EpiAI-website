import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EXAM_COOKIE, readExamSession } from '@/lib/admission/crypto';
import { autoScoreAnswer } from '@/lib/admission/grade';
import { examWindow } from '@/lib/admission/time';
import { INTEGRITY_EVENT_TYPES } from '@/lib/admission/types';
import { setApplicationPipeline } from '@/lib/membership/repository';

async function loadSession(request: NextRequest) {
  const token = request.cookies.get(EXAM_COOKIE)?.value;
  const payload = readExamSession(token);
  if (!payload) return null;
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: payload.attemptId },
    include: {
      booking: { include: { slot: { include: { exam: true } }, application: true } },
      answers: { include: { question: true } },
    },
  });
  if (!attempt) return null;
  return attempt;
}

export async function GET(request: NextRequest) {
  const attempt = await loadSession(request);
  if (!attempt) return NextResponse.json({ error: 'Session expirée. Reconnecte-toi.' }, { status: 401 });

  const exam = attempt.booking.slot.exam;
  const { openAt, closeAt } = examWindow(attempt.booking.slot.startsAt, exam.durationMinutes);
  const now = Date.now();
  const started = now >= attempt.booking.slot.startsAt.getTime();
  const ended = now >= closeAt.getTime() || Boolean(attempt.submittedAt);

  return NextResponse.json({
    firstName: attempt.booking.application.firstName,
    examTitle: exam.title,
    instructions: exam.instructions,
    durationMinutes: exam.durationMinutes,
    startsAt: attempt.booking.slot.startsAt.toISOString(),
    openAt: openAt.toISOString(),
    closeAt: closeAt.toISOString(),
    started,
    submitted: Boolean(attempt.submittedAt),
    ended,
    serverNow: new Date(now).toISOString(),
    questions:
      started && !ended
        ? attempt.answers
            .sort((a, b) => a.question.sortOrder - b.question.sortOrder)
            .map((row) => ({
              id: row.questionId,
              prompt: row.question.prompt,
              type: row.question.type,
              points: row.question.points,
              response: row.response,
            }))
        : [],
  });
}

export async function PUT(request: NextRequest) {
  const attempt = await loadSession(request);
  if (!attempt) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (attempt.submittedAt) return NextResponse.json({ error: 'Déjà envoyé.' }, { status: 409 });

  const { closeAt } = examWindow(attempt.booking.slot.startsAt, attempt.booking.slot.exam.durationMinutes);
  if (Date.now() > closeAt.getTime()) {
    return NextResponse.json({ error: 'Temps écoulé.' }, { status: 403 });
  }
  if (Date.now() < attempt.booking.slot.startsAt.getTime()) {
    return NextResponse.json({ error: 'Le test n’a pas encore commencé.' }, { status: 403 });
  }

  if (!attempt.startedAt) {
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: { startedAt: new Date() },
    });
    await setApplicationPipeline(attempt.applicationId, {
      status: 'testing',
      pipelineStage: 'test_live',
    });
  }

  const body = (await request.json()) as { answers?: Array<{ questionId: string; response: string }> };
  for (const row of body.answers || []) {
    await prisma.examAnswer.updateMany({
      where: { attemptId: attempt.id, questionId: row.questionId },
      data: { response: String(row.response || '').slice(0, 20_000) },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const attempt = await loadSession(request);
  if (!attempt) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    event?: string;
    detail?: string;
    answers?: Array<{ questionId: string; response: string }>;
    timedOut?: boolean;
  };

  if (body.action === 'event') {
    const type = INTEGRITY_EVENT_TYPES.includes(body.event as (typeof INTEGRITY_EVENT_TYPES)[number])
      ? body.event!
      : 'shortcut';
    if (type !== 'heartbeat') {
      await prisma.examIntegrityEvent.create({
        data: {
          attemptId: attempt.id,
          type,
          detail: String(body.detail || '').slice(0, 500),
        },
      });
      const serious = ['fullscreen_exit', 'tab_hidden', 'window_blur', 'copy', 'paste', 'print'];
      if (serious.includes(type)) {
        await prisma.examAttempt.update({
          where: { id: attempt.id },
          data: { integrityFlag: true },
        });
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (attempt.submittedAt) return NextResponse.json({ ok: true, already: true });

  for (const row of body.answers || []) {
    await prisma.examAnswer.updateMany({
      where: { attemptId: attempt.id, questionId: row.questionId },
      data: { response: String(row.response || '').slice(0, 20_000) },
    });
  }

  const answers = await prisma.examAnswer.findMany({
    where: { attemptId: attempt.id },
    include: { question: true },
  });
  let autoScore = 0;
  for (const row of answers) {
    const score = autoScoreAnswer({
      type: row.question.type,
      officialAnswer: row.question.officialAnswer,
      response: row.response,
      points: row.question.points,
    });
    autoScore += score;
    await prisma.examAnswer.update({ where: { id: row.id }, data: { autoScore: score } });
  }

  await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: {
      submittedAt: new Date(),
      timedOut: Boolean(body.timedOut),
      autoScore,
      adminScore: autoScore,
      gradeStatus: 'pending',
      startedAt: attempt.startedAt || new Date(),
    },
  });
  await setApplicationPipeline(attempt.applicationId, {
    status: 'testing',
    pipelineStage: 'test_submitted',
  });

  const res = NextResponse.json({ ok: true, submitted: true });
  res.cookies.set(EXAM_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
