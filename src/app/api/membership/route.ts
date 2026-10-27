import { NextRequest, NextResponse } from 'next/server';
import { createApplication, hasPendingApplication, getApplications, getApplicationStats } from '@/lib/membership/repository';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  applicationPayload,
  isValidEmail,
  isValidWhatsapp,
} from '@/lib/membership/validate';

function localeFrom(request: NextRequest, body: Record<string, unknown>) {
  if (body.locale === 'en' || body.locale === 'fr') return body.locale;
  const referer = request.headers.get('referer') || '';
  return referer.includes('/en/') ? 'en' : 'fr';
}

function message(fr: boolean, key: 'required' | 'email' | 'whatsapp' | 'exists' | 'rate' | 'fail') {
  const copy = {
    required: {
      fr: 'Tous les champs sont obligatoires.',
      en: 'All fields are required.',
    },
    email: {
      fr: 'Indique un e-mail valide, par exemple prenom.nom@epitech.eu',
      en: 'Enter a valid email, for example first.last@epitech.eu',
    },
    whatsapp: {
      fr: 'Indique un numéro WhatsApp valide, par exemple +229 01 40 00 00 00',
      en: 'Enter a valid WhatsApp number, for example +229 01 40 00 00 00',
    },
    exists: {
      fr: 'Une candidature existe déjà pour cet e-mail.',
      en: 'A membership application already exists for this email.',
    },
    rate: {
      fr: 'Trop de tentatives. Réessaie dans une minute.',
      en: 'Too many attempts. Please try again in a minute.',
    },
    fail: {
      fr: "Impossible d'enregistrer la candidature. Réessaie dans un instant.",
      en: 'Could not save the application. Please try again in a moment.',
    },
  } as const;
  return copy[key][fr ? 'fr' : 'en'];
}

// POST /api/membership - Créer une candidature
export async function POST(request: NextRequest) {
  let fr = true;
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`membership:${ip}`, 5, 60_000);
    const raw = (await request.json()) as Record<string, unknown>;
    fr = localeFrom(request, raw) !== 'en';

    if (!limited.ok) {
      return NextResponse.json(
        { error: message(fr, 'rate') },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
      );
    }

    const body = applicationPayload(raw);
    if (!body.firstName || !body.lastName || !body.email || !body.whatsapp || !body.motivations) {
      return NextResponse.json({ error: message(fr, 'required') }, { status: 400 });
    }
    if (!isValidEmail(body.email)) {
      return NextResponse.json({ error: message(fr, 'email') }, { status: 400 });
    }
    if (!isValidWhatsapp(body.whatsapp)) {
      return NextResponse.json({ error: message(fr, 'whatsapp') }, { status: 400 });
    }

    const existing = await hasPendingApplication(body.email);
    if (existing) {
      return NextResponse.json({ error: message(fr, 'exists') }, { status: 409 });
    }

    const application = await createApplication(body);

    try {
      const { sendApplicationReceivedEmail } = await import('@/lib/email/resend');
      await sendApplicationReceivedEmail(body.email, body.firstName);
    } catch (emailErr) {
      console.error('Application received email failed:', emailErr);
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating membership application:', error);
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
    if (code === '11000' || code === 'P2002') {
      return NextResponse.json({ error: message(fr, 'exists') }, { status: 409 });
    }

    return NextResponse.json({ error: message(fr, 'fail') }, { status: 500 });
  }
}

// GET /api/membership - Liste des candidatures (admin only)
export async function GET(request: NextRequest) {
  try {
    // Vérifier permission admin
    const { checkUserPermission } = await import('@/lib/auth/checkPermission');
    const permCheck = await checkUserPermission('membership.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Si c'est une requête pour les stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getApplicationStats();
      return NextResponse.json(stats);
    }

    const result = await getApplications({ status, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
