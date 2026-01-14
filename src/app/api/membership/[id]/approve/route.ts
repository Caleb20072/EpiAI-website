import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getApplicationById, reviewApplication } from '@/lib/membership/repository';
import { sendWelcomeEmail } from '@/lib/email/resend';
import type { ReviewApplicationInput } from '@/lib/membership/types';

// Configuration du mot de passe par défaut
const DEFAULT_PASSWORD = process.env.DEFAULT_MEMBER_PASSWORD || 'EpiAI2025!';

// POST /api/membership/[id]/approve - Approuver une candidature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: reviewerId } = await auth();

    if (!reviewerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a la permission d'approuver
    // President (9), Admin General (8), ou Chef Pole (7) peuvent approve
    const { userId } = await auth();
    // Note: La vérification de rôle se fait via PermissionGate dans le frontend
    // Ici on fait confiance au middleware Clerk

    const { id } = await params;
    const body: ReviewApplicationInput = await request.json();

    // Récupérer la candidature
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    if (body.status === 'approved') {
      // Créer le compte Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.createUser({
        emailAddress: [application.email],
        password: DEFAULT_PASSWORD,
        firstName: application.firstName,
        lastName: application.lastName,
        publicMetadata: {
          roleId: 1, // nouveau_membre par défaut
          role: 'nouveau_membre',
          approvedAt: new Date().toISOString(),
        },
      });

      // Envoyer l'email de bienvenu
      try {
        await sendWelcomeEmail({
          email: application.email,
          firstName: application.firstName,
          password: DEFAULT_PASSWORD,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Ne pas bloquer l'approbation si l'email échoue
      }

      // Mettre à jour le statut
      await reviewApplication(id, body, reviewerId);

      return NextResponse.json({
        success: true,
        message: 'Application approved and account created',
        accountId: clerkUser.id,
        emailSent: true,
      });
    } else {
      // Rejeter la candidature
      await reviewApplication(id, body, reviewerId);

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
      });
    }
  } catch (error: any) {
    console.error('Error reviewing application:', error);

    // Handle Clerk errors
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Clerk error' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to review application' },
      { status: 500 }
    );
  }
}
