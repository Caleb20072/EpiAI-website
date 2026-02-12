import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { sendApplicationReceivedEmail } from '@/lib/email/resend';
import { MembershipApplication } from '@/lib/membership/models';
import { connectToDatabase } from '@/lib/mongodb/client';

const DEFAULT_PASSWORD = process.env.DEFAULT_MEMBER_PASSWORD || '00000000';

interface UserRow {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Role level mapping
const ROLE_LEVELS: Record<string, number> = {
  president: 9,
  admin_general: 8,
  chef_pole: 7,
  mentor_senior: 6,
  mentor: 5,
  chef_equipe: 4,
  membre_equipe: 3,
  membre: 2,
  nouveau_membre: 1,
};

// Assignation de permission
const RESTRICTED_ROLES = ['president', 'admin_general'];

const ROLE_MAPPING: Record<string, string> = {
  'president': 'president',
  'general admin': 'admin_general', 'admin': 'admin_general',
  'head of pole': 'chef_pole', 'pole lead': 'chef_pole',
  'senior mentor': 'mentor_senior',
  'mentor': 'mentor',
  'team lead': 'chef_equipe', 'team manager': 'chef_equipe',
  'team member': 'membre_equipe',
  'member': 'membre',
  'new member': 'nouveau_membre'
};

// POST /api/admin/bulk-invite
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verification des permissions
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const currentRoleId = (currentUser.publicMetadata?.roleId as number) || 0;

    if (currentRoleId < 7) {
      return NextResponse.json(
        { error: 'You do not have permission to invite users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { users }: { users: UserRow[] } = body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'No users provided' },
        { status: 400 }
      );
    }

    if (users.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 users per request' },
        { status: 400 }
      );
    }

    // Validation de tous les users d'abord
    const validRoles = Object.keys(ROLE_LEVELS);
    const errors: string[] = [];
    const usersToCreate: UserRow[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const rowNum = i + 1;

      // Validation
      if (!user.firstName?.trim()) {
        errors.push(`Row ${rowNum}: Missing firstName`);
        continue;
      }
      if (!user.lastName?.trim()) {
        errors.push(`Row ${rowNum}: Missing lastName`);
        continue;
      }
      if (!user.email?.trim()) {
        errors.push(`Row ${rowNum}: Missing email`);
        continue;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push(`Row ${rowNum}: Invalid email format`);
        continue;
      }


      let role = user.role?.toLowerCase().trim();

      if (role && ROLE_MAPPING[role]) {
        role = ROLE_MAPPING[role];
      }

      if (!validRoles.includes(role)) {
        errors.push(`Row ${rowNum}: Invalid role "${user.role}"`);
        continue;
      }

      // Checker role permissions
      if (RESTRICTED_ROLES.includes(role)) {
        if (currentRoleId < 8) { // Only president can assign president/admin_general
          errors.push(`Row ${rowNum}: Cannot assign "${role}" role`);
          continue;
        }
      }

      // Check if role level is too high
      const targetLevel = ROLE_LEVELS[role];
      if (targetLevel >= currentRoleId) {
        errors.push(`Row ${rowNum}: Cannot assign role equal or higher than yours`);
        continue;
      }

      usersToCreate.push({
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        email: user.email.toLowerCase().trim(),
        role: role!,
      });
    }

    // Get existing emails to skip
    let created = 0;
    let failed = 0;
    const creationErrors: string[] = [];

    await connectToDatabase();

    // Process users in batches of 10
    const batchSize = 10;
    for (let i = 0; i < usersToCreate.length; i += batchSize) {
      const batch = usersToCreate.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Checker si une candidature existe déjà
            const existing = await MembershipApplication.findOne({
              email: user.email,
              status: { $in: ['pending', 'approved'] }
            });

            if (existing) {
              creationErrors.push(`${user.email}: Application already exists`);
              failed++;
              return;
            }

            // Créer une candidature (MembershipApplication)
            await MembershipApplication.create({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              whatsapp: 'Non renseigné (Import)',
              motivations: 'Importé via Bulk Invite (Admin)',
              requestedRole: user.role, // Sauvegarder le role demandé
              status: 'pending'
            });

            // Envoyer l'email de confirmation de candidature
            try {
              await sendApplicationReceivedEmail(user.email, user.firstName);
            } catch (emailError) {
              console.error(`Failed to send email to ${user.email}:`, emailError);
            }

            created++;
          } catch (err: any) {
            console.error(`Failed to create application for ${user.email}:`, err);
            creationErrors.push(`${user.email}: ${err.message || 'Failed to create'}`);
            failed++;
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      created,
      failed: failed + errors.length,
      errors: [...errors, ...creationErrors],
      summary: {
        total: users.length,
        valid: usersToCreate.length,
        invalid: users.length - usersToCreate.length,
      },
    });
  } catch (error: any) {
    console.error('Error in bulk invite:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process bulk invite' },
      { status: 500 }
    );
  }
}
