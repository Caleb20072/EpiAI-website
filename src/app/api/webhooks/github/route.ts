import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordGithubCommit } from '@/lib/modules/repository';

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const raw = await request.text();
  if (secret) {
    const signature = request.headers.get('x-hub-signature-256') || '';
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(raw).digest('hex')}`;
    const valid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = request.headers.get('x-github-event');
  if (event !== 'push') return NextResponse.json({ ok: true, ignored: event });

  const payload = JSON.parse(raw);
  const repoName = payload?.repository?.name as string | undefined;
  const commits = Array.isArray(payload?.commits) ? payload.commits : [];
  if (!repoName) return NextResponse.json({ ok: true });

  for (const commit of commits) {
    await recordGithubCommit({
      repoName,
      sha: commit.id,
      message: commit.message || '',
      additions: Number(commit.added?.length || 0),
      deletions: Number(commit.removed?.length || 0),
      committedAt: commit.timestamp || new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, recorded: commits.length });
}
