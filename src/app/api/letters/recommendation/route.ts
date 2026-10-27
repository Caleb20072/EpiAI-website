import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/users/repository';
import {
  buildRecommendationPdf,
  letterFilename,
  type LetterGender,
} from '@/lib/letters/recommendation';
import { fieldsForLetterLocale } from '@/lib/letters/localize-fields';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByClerkId(userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    gender?: LetterGender;
    memberRole?: string;
    focus?: string;
    contributions?: string;
    locale?: 'fr' | 'en';
    uiLocale?: 'fr' | 'en';
  };

  const letterLocale = body.locale === 'en' ? 'en' : 'fr';
  const uiLocale = body.uiLocale === 'en' ? 'en' : 'fr';
  const firstName = (body.firstName || user.firstName || '').trim();
  const lastName = (body.lastName || user.lastName || '').trim();
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: uiLocale === 'en' ? 'First and last name are required.' : 'Le prénom et le nom sont requis.' },
      { status: 400 },
    );
  }
  if (body.gender !== 'm' && body.gender !== 'f') {
    return NextResponse.json(
      {
        error:
          uiLocale === 'en'
            ? 'Select a gender so the letter can agree grammatically.'
            : 'Indique le genre pour l’accord de la lettre.',
      },
      { status: 400 },
    );
  }

  const localized = await fieldsForLetterLocale({
    memberRole: (body.memberRole || '').trim(),
    focus: (body.focus || '').trim(),
    contributions: (body.contributions || '').trim(),
    gender: body.gender,
    locale: letterLocale,
  });

  const pdf = await buildRecommendationPdf({
    firstName,
    lastName,
    gender: body.gender,
    memberRole: localized.memberRole,
    focus: localized.focus,
    contributions: localized.contributions,
    locale: letterLocale,
  });

  const filename = letterFilename(firstName, lastName, letterLocale);
  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
