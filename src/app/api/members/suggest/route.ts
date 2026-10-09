import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { matchMembers, type MemberSuggestion } from '@/lib/members/suggest';

export async function GET(request: NextRequest) {
  const admin = await checkUserPermission('dashboard.admin');
  if (!('allowed' in admin)) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() || '';
  if (query.length < 1) return NextResponse.json([]);

  const dbUsers = await prisma.user.findMany({
    select: { clerkId: true, firstName: true, lastName: true, email: true },
    orderBy: { firstName: 'asc' },
    take: 400,
  });

  const people = new Map<string, MemberSuggestion>();
  for (const user of dbUsers) {
    const name = `${user.firstName} ${user.lastName}`.trim();
    people.set(user.clerkId, {
      id: user.clerkId,
      name: name || user.email,
      email: user.email,
    });
  }

  try {
    const client = await clerkClient();
    const listed = await client.users.getUserList({ query, limit: 10 });
    for (const user of listed.data) {
      const email = user.emailAddresses[0]?.emailAddress || '';
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email || user.id;
      const existing = people.get(user.id);
      people.set(user.id, {
        id: user.id,
        name: name || existing?.name || user.id,
        email: email || existing?.email || '',
      });
    }
  } catch (error) {
    console.warn('[members/suggest] Clerk search failed, using the local directory:', error);
  }

  return NextResponse.json(matchMembers([...people.values()], query));
}
