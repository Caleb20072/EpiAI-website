import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { hasAnyAdmin, createUserWithRole, INVITABLE_ROLES, PRESIDENT_ROLE } from '@/lib/admin/repository';
import { sendWelcomeEmail } from '@/lib/email/resend';

// Fonction pour générer un mot de passe sécurisé aléatoire
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const all = uppercase + lowercase + numbers + special;
  let password = '';

  // Au moins une lettre majuscule
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  // Au moins une lettre minuscule
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  // Au moins un chiffre
  password += numbers[Math.floor(Math.random() * numbers.length)];
  // Au moins un caractère spécial
  password += special[Math.floor(Math.random() * special.length)];

  // Remplir le reste (16 caractères total)
  for (let i = 4; i < 16; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// GET /api/admin/invite - Vérifier si premier admin requis
export async function GET(request: NextRequest) {
  try {
    const hasAdmin = await hasAnyAdmin();

    return NextResponse.json({
      needsFirstAdmin: !hasAdmin,
      inviteableRoles: INVITABLE_ROLES,
      presidentRole: PRESIDENT_ROLE,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check admin status' },
      { status: 500 }
    );
  }
}

// POST /api/admin/invite - Inviter un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, roleId } = body;

    // Validation stricte des champs
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required and must be a valid string' },
        { status: 400 }
      );
    }

    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return NextResponse.json(
        { error: 'First name is required and must be a valid string' },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
      return NextResponse.json(
        { error: 'Last name is required and must be a valid string' },
        { status: 400 }
      );
    }

    if (!roleId || typeof roleId !== 'string') {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Normaliser les données
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    // Vérifier si c'est le premier admin
    const isFirstAdminFlow = !(await hasAnyAdmin());

    // Pour le premier admin, aucune vérification d'auth n'est nécessaire
    if (!isFirstAdminFlow) {
      return NextResponse.json(
        { error: 'First admin already exists. Use the admin panel to invite new users.' },
        { status: 403 }
      );
    }

    if (roleId !== 'president') {
      return NextResponse.json(
        { error: 'First admin must have president role' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const client = await clerkClient();
    try {
      const existing = await client.users.getUserList({
        emailAddress: [normalizedEmail],
        limit: 1,
      });

      if (existing.data.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    } catch (e) {
      // Continue if no user found
    }

    // Générer un mot de passe sécurisé
    const password = generateSecurePassword();

    // Créer le compte avec les données normalisées
    const user = await client.users.createUser({
      emailAddress: [normalizedEmail],
      password,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      skipPasswordChecks: true,
      publicMetadata: {
        roleId: 9, // president
        role: 'president',
        mustResetPassword: true,
      },
    });

    // Envoyer l'email de bienvenue
    try {
      await sendWelcomeEmail({
        email: normalizedEmail,
        firstName: normalizedFirstName,
        password,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Ne pas échouer la création si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: 'User invited successfully',
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || normalizedEmail,
        firstName: user.firstName || normalizedFirstName,
        lastName: user.lastName || normalizedLastName,
        role: roleId,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/admin/invite] Error:', error);
    console.error('[POST /api/admin/invite] Error details:', JSON.stringify(error, null, 2));

    // Gérer les erreurs Clerk de différentes manières
    let errorMessage = 'Failed to create president account';

    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      errorMessage = error.errors[0]?.message || error.errors[0]?.longMessage || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 422 || error.statusCode === 422) {
      errorMessage = 'Invalid data provided. Please check all fields.';
    } else if (error.status === 401 || error.statusCode === 401) {
      errorMessage = 'Authentication error. Please check your Clerk configuration.';
    }

    const statusCode = error.status || error.statusCode || 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 }
    );
  }
}
