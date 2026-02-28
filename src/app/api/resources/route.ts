import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getResources,
  createResource,
  getFeaturedResources,
} from '@/lib/resources/repository';
import type { ResourceFilters, CreateResourceInput } from '@/lib/resources/types';
import { checkUserPermission } from '@/lib/auth/checkPermission';

// GET /api/resources - List resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ResourceFilters = {
      categoryId: searchParams.get('category') || undefined,
      type: searchParams.get('type') || undefined,
      tag: searchParams.get('tag') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') === 'true',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await getResources(filters, { page, limit });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create resource (mentors+ uniquement)
export async function POST(request: NextRequest) {
  try {
    const check = await checkUserPermission('resources.create');
    if (!('allowed' in check)) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const { userId } = check;

    const body: CreateResourceInput = await request.json();

    // Validation
    if (!body.title || !body.description || !body.type || !body.url || !body.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resource = await createResource(body, userId);

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create resource' },
      { status: 500 }
    );
  }
}
