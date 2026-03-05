import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { Resource } from '@/lib/resources/models';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * GET /api/resources/[id]/serve
 * Serves the resource file inline (for viewing inside the platform).
 * Requires authentication. Uses Content-Disposition: inline to prevent automatic download.
 *
 * Query params:
 *   - download=true  → forces download (Content-Disposition: attachment), only if isDownloadable
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const forceDownload = searchParams.get('download') === 'true';

        await connectToDatabase();
        const resource = await Resource.findById(id);

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // If the user wants to download but resource is not downloadable → deny
        if (forceDownload && !resource.isDownloadable) {
            return NextResponse.json({ error: 'This resource is not downloadable' }, { status: 403 });
        }

        // Determine which file path to use
        const fileRelativePath: string | undefined = resource.fileUrl || resource.url;

        if (!fileRelativePath || !fileRelativePath.startsWith('/uploads/')) {
            return NextResponse.json({ error: 'No file available for this resource' }, { status: 404 });
        }

        // Build absolute path from the public directory
        const absolutePath = path.join(process.cwd(), 'public', fileRelativePath);

        if (!existsSync(absolutePath)) {
            return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
        }

        const fileBuffer = await readFile(absolutePath);

        // Determine MIME type
        const mimeType = resource.fileType || guessMimeType(fileRelativePath);
        const filename = path.basename(fileRelativePath);

        // Increment view or download count
        if (forceDownload) {
            await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
        } else {
            await Resource.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
        }

        const disposition = forceDownload
            ? `attachment; filename="${filename}"`
            : `inline; filename="${filename}"`;

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': disposition,
                'Content-Length': fileBuffer.length.toString(),
                // Prevent client-side caching of sensitive files
                'Cache-Control': 'private, no-store',
                // Prevent embedding in external sites
                'X-Frame-Options': 'SAMEORIGIN',
            },
        });
    } catch (error: any) {
        console.error('[serve/resource] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to serve file' },
            { status: 500 }
        );
    }
}

function guessMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const map: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        csv: 'text/csv',
        json: 'application/json',
        xml: 'application/xml',
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        webm: 'video/webm',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        zip: 'application/zip',
    };
    return map[ext] || 'application/octet-stream';
}
