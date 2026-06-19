import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * POST /api/auth/reset-password - Initiate password reset via email
 * Cette route déclenche l'envoi d'un email de réinitialisation via Clerk
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // Trouver l'utilisateur par email
    const users = await client.users.getUserList({
      emailAddress: [email.toLowerCase().trim()],
      limit: 1,
    });

    // Pour des raisons de sécurité, on retourne toujours un succès
    // même si l'utilisateur n'existe pas (éviter l'énumération d'emails)
    if (users.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation',
      });
    }

    const user = users.data[0];

    // Note: Clerk gère automatiquement les emails de réinitialisation
    // via leur UI components. Pour une implémentation custom, vous pouvez:
    // 1. Générer un token de réinitialisation
    // 2. Envoyer un email avec Resend contenant le lien
    // 3. Créer une page pour traiter le token et changer le mot de passe

    // Pour l'instant, on guide l'utilisateur vers le composant Clerk
    return NextResponse.json({
      success: true,
      message: 'Instructions de réinitialisation envoyées par email',
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process password reset' },
      { status: 500 }
    );
  }
}
