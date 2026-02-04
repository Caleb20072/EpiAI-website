import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getEvents,
  createEvent,
  getFeaturedEvents,
} from '@/lib/events/repository';
import type { EventFilters, CreateEventInput } from '@/lib/events/types';

// GET /api/events - List events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: EventFilters = {
      categoryId: searchParams.get('category') || undefined,
      upcoming: searchParams.get('upcoming') === 'true',
      past: searchParams.get('past') === 'true',
      search: searchParams.get('search') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');

    const { userId } = await auth();

    const result = await getEvents(filters, { page, limit }, userId || undefined);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create event (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real app, check if user is admin
    // For now, allow any authenticated user to create events

    const body: CreateEventInput = await request.json();

    // Validation
    if (!body.title || !body.description || !body.categoryId || !body.date || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await createEvent(body, userId);

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
