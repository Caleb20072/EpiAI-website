import { NextRequest, NextResponse } from 'next/server';
import { createApplication, hasPendingApplication, getApplications, getApplicationStats } from '@/lib/membership/repository';
import type { CreateMembershipInput } from '@/lib/membership/types';

// POST /api/membership - Créer une candidature
export async function POST(request: NextRequest) {
  try {
    const body: CreateMembershipInput = await request.json();

    // Validation
    if (!body.firstName || !body.lastName || !body.email || !body.whatsapp || !body.motivations) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Vérifier si l'email a déjà une candidature en attente ou approuvée
    const existing = await hasPendingApplication(body.email);
    if (existing) {
      return NextResponse.json(
        { error: 'A membership application already exists for this email' },
        { status: 409 }
      );
    }

    const application = await createApplication(body);

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Error creating membership application:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A membership application already exists for this email' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}

// GET /api/membership - Liste des candidatures (admin)
export async function GET(request: NextRequest) {
  try {
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
