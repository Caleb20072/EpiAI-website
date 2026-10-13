import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { createModule, listModulesForUser } from '@/lib/modules/repository';

async function leadDisplayName(userId: string, fallback: string) {
  const client = await clerkClient();
  const lead = await client.users.getUser(userId).catch(() => null);
  if (!lead) return fallback || userId;
  return `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.emailAddresses[0]?.emailAddress || fallback || userId;
}

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

  const secondId = String(body.lead2UserId || '').trim();
  if (secondId && secondId === body.leadUserId) {
    return NextResponse.json({ error: 'Les deux leads doivent être deux personnes différentes' }, { status: 400 });
  }
  const leadName = await leadDisplayName(body.leadUserId, body.leadName || '');
  const lead2Name = secondId ? await leadDisplayName(secondId, body.lead2Name || '') : null;

  const created = await createModule({
    name: body.name,
    description: body.description || '',
    leadUserId: body.leadUserId,
    leadName,
    lead2UserId: secondId || null,
    lead2Name,
    createdBy: admin.userId,
  });
  return NextResponse.json(created, { status: 201 });
}
