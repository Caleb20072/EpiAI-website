import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { addModuleMaterial, canManageModule, getModuleDetail } from '@/lib/modules/repository';

const MAX_BYTES = 6 * 1024 * 1024;
const FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const FILE_EXT = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'txt', 'jpg', 'jpeg', 'png', 'webp']);

function httpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function assertManager(id: string, userId: string) {
  const learningModule = await getModuleDetail(id);
  if (!learningModule) return { error: 'Introuvable', status: 404 as const };
  const admin = await checkUserPermission('dashboard.admin');
  if (!canManageModule(learningModule, userId, 'allowed' in admin)) {
    return { error: 'Accès refusé', status: 403 as const };
  }
  return { learningModule };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const gate = await assertManager(id, userId);
  if ('error' in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const file = form.get('file');
      const title = String(form.get('title') || '').trim();
      const projectId = String(form.get('projectId') || '').trim() || null;
      if (!(file instanceof File) || !title) {
        return NextResponse.json({ error: 'Titre et fichier requis' }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: 'Fichier trop lourd (6 Mo maximum). Pour un PDF plus gros, dépose un lien.' },
          { status: 400 }
        );
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!FILE_EXT.has(ext) || (file.type && !FILE_TYPES.has(file.type) && file.type !== 'application/octet-stream')) {
        return NextResponse.json({ error: 'Type de fichier non accepté. PDF, document, image ou zip.' }, { status: 400 });
      }
      const material = await addModuleMaterial({
        moduleId: id,
        projectId,
        kind: 'file',
        title,
        fileName: file.name.replace(/[^\w.\- ()]/g, '_').slice(0, 180),
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        bytes: Buffer.from(await file.arrayBuffer()),
        createdBy: userId,
      });
      return NextResponse.json(material, { status: 201 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const kind = body.kind === 'video' ? 'video' : 'link';
    const url = httpUrl(String(body.url || ''));
    if (!title || !url) {
      return NextResponse.json({ error: 'Titre et lien http(s) requis' }, { status: 400 });
    }
    const material = await addModuleMaterial({
      moduleId: id,
      projectId: body.projectId || null,
      kind,
      title,
      url,
      createdBy: userId,
    });
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur' },
      { status: 400 }
    );
  }
}
