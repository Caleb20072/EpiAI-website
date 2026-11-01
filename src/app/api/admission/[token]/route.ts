import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateExamLogin } from '@/lib/admission/crypto';
import { sendSlotChosenEmail, sendInterviewSlotEmail, sendExamCredentialsEmail } from '@/lib/admission/emails';
import { examWindow } from '@/lib/admission/time';
import { setApplicationPipeline } from '@/lib/membership/repository';
import { generateExamPassword, hashPassword } from '@/lib/admission/crypto';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const application = await prisma.membershipApplication.findUnique({ where: { accessToken: token } });
  if (!application) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 404 });

  const examBooking = await prisma.examBooking.findFirst({
    where: { applicationId: application.id },
    include: { slot: { include: { exam: true } }, attempt: true },
    orderBy: { createdAt: 'desc' },
  });
  const interviewBooking = await prisma.interviewBooking.findUnique({
    where: { applicationId: application.id },
    include: { slot: true },
  });

  const stage = application.pipelineStage;
  const declined = stage === 'test_declined' || stage === 'interview_declined';
  const needExamSlot =
    !declined && (stage === 'test_invited' || (application.status === 'testing' && !examBooking && stage !== 'test_declined'));
  const needInterviewSlot =
    !declined &&
    (stage === 'interview_invited' ||
      (application.status === 'interviewing' && !interviewBooking && stage !== 'interview_declined'));

  const examSlots = needExamSlot
    ? await prisma.examSlot.findMany({
        where: {
          startsAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
          exam: { published: true },
        },
        include: { exam: { select: { title: true, durationMinutes: true } }, _count: { select: { bookings: true } } },
        orderBy: { startsAt: 'asc' },
      })
    : [];

  const interviewSlots = needInterviewSlot
    ? await prisma.interviewSlot.findMany({
        where: { startsAt: { gte: new Date() } },
        include: { _count: { select: { bookings: true } } },
        orderBy: { startsAt: 'asc' },
      })
    : [];

  return NextResponse.json({
    firstName: application.firstName,
    status: application.status,
    stage,
    examBooking: examBooking
      ? {
          startsAt: examBooking.slot.startsAt.toISOString(),
          examTitle: examBooking.slot.exam.title,
          submitted: Boolean(examBooking.attempt?.submittedAt),
        }
      : null,
    interviewBooking: interviewBooking
      ? {
          startsAt: interviewBooking.slot.startsAt.toISOString(),
          room: interviewBooking.slot.room,
        }
      : null,
    declined,
    canDecline: needExamSlot || needInterviewSlot,
    examSlots: examSlots
      .filter((s) => s._count.bookings < s.capacity)
      .map((s) => ({
        id: s.id,
        startsAt: s.startsAt.toISOString(),
        examTitle: s.exam.title,
        durationMinutes: s.exam.durationMinutes,
        remaining: s.capacity - s._count.bookings,
      })),
    interviewSlots: interviewSlots
      .filter((s) => s._count.bookings < s.capacity)
      .map((s) => ({
        id: s.id,
        startsAt: s.startsAt.toISOString(),
        room: s.room,
        remaining: s.capacity - s._count.bookings,
      })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const application = await prisma.membershipApplication.findUnique({ where: { accessToken: token } });
  if (!application) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 404 });
  const body = (await request.json()) as { kind?: string; slotId?: string; decline?: boolean };

  if (body.decline) {
    if (body.kind === 'interview' || application.status === 'interviewing') {
      if (await prisma.interviewBooking.findUnique({ where: { applicationId: application.id } })) {
        return NextResponse.json({ error: 'Créneau déjà confirmé.' }, { status: 409 });
      }
      await setApplicationPipeline(application.id, {
        status: 'interviewing',
        pipelineStage: 'interview_declined',
      });
    } else {
      if (await prisma.examBooking.findFirst({ where: { applicationId: application.id } })) {
        return NextResponse.json({ error: 'Créneau déjà confirmé.' }, { status: 409 });
      }
      await setApplicationPipeline(application.id, {
        status: 'testing',
        pipelineStage: 'test_declined',
      });
    }
    return NextResponse.json({ success: true, declined: true });
  }

  if (!body.slotId) return NextResponse.json({ error: 'Créneau requis' }, { status: 400 });

  if (body.kind === 'interview') {
    const existing = await prisma.interviewBooking.findUnique({ where: { applicationId: application.id } });
    if (existing) return NextResponse.json({ error: 'Tu as déjà un créneau d’entretien.' }, { status: 409 });
    const slot = await prisma.interviewSlot.findUnique({
      where: { id: body.slotId },
      include: { _count: { select: { bookings: true } } },
    });
    if (!slot) return NextResponse.json({ error: 'Créneau introuvable' }, { status: 404 });
    if (slot._count.bookings >= slot.capacity) {
      return NextResponse.json({ error: 'Ce créneau est complet.' }, { status: 409 });
    }
    await prisma.interviewBooking.create({
      data: { slotId: slot.id, applicationId: application.id },
    });
    await setApplicationPipeline(application.id, {
      status: 'interviewing',
      pipelineStage: 'interview_scheduled',
    });
    await sendInterviewSlotEmail({
      email: application.email,
      firstName: application.firstName,
      when: slot.startsAt,
      room: slot.room,
    });
    return NextResponse.json({ success: true });
  }

  const existing = await prisma.examBooking.findFirst({ where: { applicationId: application.id } });
  if (existing) return NextResponse.json({ error: 'Tu as déjà un créneau de test.' }, { status: 409 });
  const slot = await prisma.examSlot.findUnique({
    where: { id: body.slotId },
    include: { exam: true, _count: { select: { bookings: true } } },
  });
  if (!slot || !slot.exam.published) return NextResponse.json({ error: 'Créneau introuvable' }, { status: 404 });
  if (slot._count.bookings >= slot.capacity) {
    return NextResponse.json({ error: 'Ce créneau est complet.' }, { status: 409 });
  }

  const login = generateExamLogin();
  const booking = await prisma.examBooking.create({
    data: {
      slotId: slot.id,
      applicationId: application.id,
      examLogin: login,
    },
  });
  await setApplicationPipeline(application.id, {
    status: 'testing',
    pipelineStage: 'test_scheduled',
  });
  await sendSlotChosenEmail({
    email: application.email,
    firstName: application.firstName,
    when: slot.startsAt,
    examTitle: slot.exam.title,
  });

  const { openAt } = examWindow(slot.startsAt, slot.exam.durationMinutes);
  if (Date.now() >= openAt.getTime()) {
    const password = generateExamPassword();
    await prisma.examBooking.update({
      where: { id: booking.id },
      data: { examPasswordHash: hashPassword(password), credentialsSentAt: new Date() },
    });
    await sendExamCredentialsEmail({
      email: application.email,
      firstName: application.firstName,
      login,
      password,
      when: slot.startsAt,
      examTitle: slot.exam.title,
    });
  }

  return NextResponse.json({ success: true });
}
