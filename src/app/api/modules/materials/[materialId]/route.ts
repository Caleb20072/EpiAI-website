import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { canManageModule, deleteModuleMaterial } from '@/lib/modules/repository';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { materialId } = await params;
  const material = await prisma.moduleMaterial.findUnique({ where: { id: materialId } });
  if (!material?.bytes) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });

  const filename = (material.fileName || 'document').replace(/["\r\n]/g, '');
  const mime = material.mimeType || 'application/octet-stream';
  const inline = mime === 'application/pdf' || mime.startsWith('image/');
  const body = new Uint8Array(material.bytes);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${filename}"`,
      'Content-Length': String(body.byteLength),
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ materialId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { materialId } = await params;
  const material = await prisma.moduleMaterial.findUnique({
    where: { id: materialId },
    include: { module: { select: { leadUserId: true } } },
  });
  if (!material) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const admin = await checkUserPermission('dashboard.admin');
  if (!canManageModule(material.module, userId, 'allowed' in admin)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  await deleteModuleMaterial(materialId);
  return NextResponse.json({ ok: true });
}
