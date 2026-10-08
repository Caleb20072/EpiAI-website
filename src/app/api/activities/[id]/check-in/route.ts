import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkInWithCode } from '@/lib/modules/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Membre';
  const userEmail = user.emailAddresses[0]?.emailAddress || '';

  try {
    const result = await checkInWithCode({
      activityId: id,
      code: String(code),
      userId,
      userName,
      userEmail,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur' },
      { status: 400 }
    );
  }
}
