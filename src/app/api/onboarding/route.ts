import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId, updateOnboarding } from '@/lib/users/repository';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    return NextResponse.json({
      step: user?.onboardingStep ?? 0,
      done: user?.onboardingDone ?? false,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { step, done } = await request.json();
    const user = await updateOnboarding(userId, step ?? 0, done ?? false);
    return NextResponse.json({ step: user.onboardingStep, done: user.onboardingDone });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
