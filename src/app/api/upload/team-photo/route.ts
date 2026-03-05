import { NextRequest, NextResponse } from 'next/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/upload/team-photo
 * Uploads a team member photo to /public/uploads/team/
 * Returns the public path to use as photoUrl
 */
export async function POST(request: NextRequest) {
    try {
        const permCheck = await checkUserPermission('team.manage');
        if ('error' in permCheck) {
            return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
        }

        const formData = await request.formData();
        const file = formData.get('photo') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        // Save to public/uploads/team/
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'team');
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(path.join(uploadDir, filename), buffer);

        const publicPath = `/uploads/team/${filename}`;
        return NextResponse.json({ url: publicPath });
    } catch (error: any) {
        console.error('[upload/team-photo] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
