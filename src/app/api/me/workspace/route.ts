import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { acceptContract, getWorkspace } from '@/lib/modules/repository';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getWorkspace(userId));
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await acceptContract(userId);
  return NextResponse.json(await getWorkspace(userId));
}
