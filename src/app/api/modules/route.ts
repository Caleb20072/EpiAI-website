import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { createModule, listModulesForUser } from '@/lib/modules/repository';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const modules = await listModulesForUser(userId);
  return NextResponse.json(modules);
}

export async function POST(request: NextRequest) {
  const admin = await checkUserPermission('dashboard.admin');
  if (!('allowed' in admin)) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = await request.json();
  if (!body.name || !body.leadUserId) {
    return NextResponse.json({ error: 'Nom et lead requis' }, { status: 400 });
  }

  const client = await clerkClient();
  const lead = await client.users.getUser(body.leadUserId).catch(() => null);
  const leadName = lead
    ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.emailAddresses[0]?.emailAddress || body.leadUserId
    : body.leadName || body.leadUserId;

  const created = await createModule({
    name: body.name,
    description: body.description || '',
    leadUserId: body.leadUserId,
    leadName,
    createdBy: admin.userId,
  });
  return NextResponse.json(created, { status: 201 });
}
