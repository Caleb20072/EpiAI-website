import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMembershipAdmin } from '@/lib/admission/admin';
import { sendTestInviteEmail } from '@/lib/admission/emails';
import { setApplicationPipeline } from '@/lib/membership/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const perm = await requireMembershipAdmin();
  if ('error' in perm) return NextResponse.json({ error: perm.error }, { status: perm.status });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { examId?: string };
  const application = await prisma.membershipApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 });
  if (application.status === 'approved' || application.status === 'rejected') {
    return NextResponse.json({ error: 'Candidature déjà traitée' }, { status: 400 });
  }

  const exam = body.examId
    ? await prisma.entranceExam.findUnique({ where: { id: body.examId } })
    : await prisma.entranceExam.findFirst({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      });
  if (!exam || !exam.published) {
    return NextResponse.json(
      { error: 'Aucun test publié. Crée un test (sujet + durée) puis publie-le.' },
      { status: 400 },
    );
  }
  const questions = await prisma.entranceExamQuestion.count({ where: { examId: exam.id } });
  if (questions === 0) {
    return NextResponse.json(
      { error: 'Ce test n’a pas encore de questions. Transforme le PDF ou ajoute-les.' },
      { status: 400 },
    );
  }

  const updated = await setApplicationPipeline(id, {
    status: 'testing',
    pipelineStage: 'test_invited',
    reviewedBy: perm.userId,
  });

  await sendTestInviteEmail({
    email: application.email,
    firstName: application.firstName,
    token: updated.accessToken,
    examTitle: exam.title,
  });

  return NextResponse.json({ success: true, examId: exam.id, examTitle: exam.title });
}
