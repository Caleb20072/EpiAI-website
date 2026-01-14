import { connectToDatabase } from '@/lib/mongodb/client';
import { clerkClient } from '@clerk/nextjs/server';
import type { RoleDefinition } from '@/lib/roles/types';

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

// Vérifier si des admins existent déjà
export async function hasAnyAdmin(): Promise<boolean> {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      limit: 100,
    });

    // Vérifier si un utilisateur a un rôle admin (level >= 7)
    return users.data.some((user) => {
      const roleId = (user.publicMetadata?.roleId as number) || 0;
      return roleId >= 7; // chef_pole and above
    });
  } catch (error) {
    console.error('[hasAnyAdmin] Error:', error);
    // En cas d'erreur, supposer qu'il n'y a pas d'admin pour permettre la création
    return false;
  }
}

// Créer un utilisateur avec un rôle spécifique
export async function createUserWithRole(
  email: string,
  firstName: string,
  lastName: string,
  roleId: string,
  password?: string
) {
  const client = await clerkClient();

  // Vérifier si l'email existe déjà
  try {
    const existing = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });

    if (existing.data.length > 0) {
      return { error: 'User with this email already exists' };
    }
  } catch (e) {
    // Continue if no user found
  }

  // Utiliser le mot de passe fourni ou en générer un
  const finalPassword = password || generateSecurePassword();

  // Créer le compte
  const user = await client.users.createUser({
    emailAddress: [email],
    password: finalPassword,
    firstName,
    lastName,
    publicMetadata: {
      roleId: getRoleLevel(roleId),
      role: roleId,
    },
  });

  return { success: true, user, password: finalPassword };
}

// Obtenir le niveau de rôle
function getRoleLevel(roleId: string): number {
  const levels: Record<string, number> = {
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
  return levels[roleId] || 1;
}

// Liste des rôles disponibles pour invitation
export const INVITABLE_ROLES = [
  { id: 'admin_general', name: { en: 'General Admin', fr: 'Admin Général' }, level: 8 },
  { id: 'chef_pole', name: { en: 'Pole Lead', fr: 'Chef de Pôle' }, level: 7 },
  { id: 'mentor_senior', name: { en: 'Senior Mentor', fr: 'Mentor Senior' }, level: 6 },
  { id: 'mentor', name: { en: 'Mentor', fr: 'Mentor' }, level: 5 },
  { id: 'chef_equipe', name: { en: 'Team Lead', fr: 'Chef d\'Équipe' }, level: 4 },
  { id: 'membre_equipe', name: { en: 'Team Member', fr: 'Membre d\'Équipe' }, level: 3 },
  { id: 'membre', name: { en: 'Member', fr: 'Membre' }, level: 2 },
  { id: 'nouveau_membre', name: { en: 'New Member', fr: 'Nouveau Membre' }, level: 1 },
];

// Pour le président (level 9), voir ci-dessous
export const PRESIDENT_ROLE = { id: 'president', name: { en: 'President', fr: 'Président' }, level: 9 };
