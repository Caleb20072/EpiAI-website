import { NextResponse } from 'next/server';
import { getActivePartners } from '@/lib/partners/repository';

export async function GET() {
  try {
    const partners = await getActivePartners();
    return NextResponse.json(partners);
  } catch (error) {
    console.error('[API] Partners error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
