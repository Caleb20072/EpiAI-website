import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  getUserByClerkId,
  updateOnboarding,
  upsertUserFromClerk,
} from '@/lib/users/repository';

async function ensureDbUser(clerkId: string) {
  const existing = await getUserByClerkId(clerkId);
  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  const meta = clerkUser.publicMetadata as Record<string, unknown>;

  return upsertUserFromClerk({
    clerkId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    firstName: clerkUser.firstName || '',
    lastName: clerkUser.lastName || '',
    role: (meta?.role as string) || 'membre',
    roleLevel: Number(meta?.roleId) || 1,
  });
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureDbUser(userId);
    return NextResponse.json({
      step: user.onboardingStep ?? 0,
      done: user.onboardingDone ?? false,
    });
  } catch (error) {
    console.error('[onboarding GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDbUser(userId);

    const { step, done } = await request.json();
    const user = await updateOnboarding(
      userId,
      typeof step === 'number' ? step : 0,
      done === true
    );

    return NextResponse.json({
      step: user.onboardingStep,
      done: user.onboardingDone,
    });
  } catch (error) {
    console.error('[onboarding PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
