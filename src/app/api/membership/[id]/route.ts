import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUserPermission } from '@/lib/auth/checkPermission';
import { getApplicationById, deleteApplication } from '@/lib/membership/repository';

// GET /api/membership/[id] - Récupérer une candidature (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier permission admin
    const permCheck = await checkUserPermission('membership.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const application = await getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// DELETE /api/membership/[id] - Supprimer une candidature
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier permission admin
    const permCheck = await checkUserPermission('membership.manage');
    if ('error' in permCheck) {
      return NextResponse.json({ error: permCheck.error }, { status: permCheck.status });
    }

    const { id } = await params;
    const success = await deleteApplication(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}
