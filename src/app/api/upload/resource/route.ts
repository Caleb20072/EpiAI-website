import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Max file size: 50MB
const MAX_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-tar',
  // Code / text
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Audio / Video
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
  // Data
  'application/parquet',
  'application/octet-stream',
  // Notebooks
  'application/x-ipynb+json',
];

/**
 * POST /api/upload/resource
 * Uploads a resource file to /public/uploads/resources/
 * Returns the public path, file size, and file type
 */
export async function POST(request: NextRequest) {
  try {
    const permCheck = await checkUserPermission('resources.create');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Validate file type (allow octet-stream as fallback for uncommon extensions)
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== 'application/octet-stream') {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed.` },
        { status: 400 }
      );
    }

    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
    const filename = `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resources');
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, filename), buffer);

    const publicPath = `/uploads/resources/${filename}`;

    return NextResponse.json({
      fileUrl: publicPath,
      fileSize: file.size,
      fileType: file.type,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error('[upload/resource] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
