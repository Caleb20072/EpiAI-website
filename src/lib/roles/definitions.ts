import type { RoleDefinition } from './types';

// Icons pour chaque rôle (utilisant lucide-react)
export const ROLES: Record<string, RoleDefinition> = {
  nouveau_membre: {
    id: 'nouveau_membre',
    name: { en: 'New Member', fr: 'Nouveau Membre' },
    level: 1,
    permissions: ['dashboard.access', 'content.edit.own', 'profile.edit'],
    color: 'text-gray-400',
    icon: 'User',
  },
  membre: {
    id: 'membre',
    name: { en: 'Member', fr: 'Membre' },
    level: 2,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'profile.edit'],
    color: 'text-blue-400',
    icon: 'Users',
  },
  membre_equipe: {
    id: 'membre_equipe',
    name: { en: 'Team Member', fr: 'Membre d\'Équipe' },
    level: 3,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'profile.edit'],
    color: 'text-cyan-400',
    icon: 'UserCog',
  },
  chef_equipe: {
    id: 'chef_equipe',
    name: { en: 'Team Lead', fr: 'Chef d\'Équipe' },
    level: 4,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'profile.edit'],
    color: 'text-teal-400',
    icon: 'Briefcase',
  },
  mentor: {
    id: 'mentor',
    name: { en: 'Mentor', fr: 'Mentor' },
    level: 5,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'profile.edit'],
    color: 'text-indigo-400',
    icon: 'GraduationCap',
  },
  mentor_senior: {
    id: 'mentor_senior',
    name: { en: 'Senior Mentor', fr: 'Mentor Senior' },
    level: 6,
    permissions: ['dashboard.access', 'content.create', 'content.edit.own', 'content.edit.all', 'profile.edit'],
    color: 'text-purple-400',
    icon: 'Award',
  },
  chef_pole: {
    id: 'chef_pole',
    name: { en: 'Pole Lead', fr: 'Chef de Pôle' },
    level: 7,
    permissions: ['dashboard.access', 'dashboard.admin', 'content.create', 'content.edit.all', 'profile.edit', 'admin.roles.assign', 'membership.manage'],
    color: 'text-amber-400',
    icon: 'Building2',
  },
  admin_general: {
    id: 'admin_general',
    name: { en: 'General Admin', fr: 'Admin Général' },
    level: 8,
    permissions: ['dashboard.access', 'dashboard.admin', 'admin.roles.assign', 'content.create', 'content.edit.all', 'profile.edit', 'profile.edit.others', 'membership.manage'],
    color: 'text-orange-500',
    icon: 'Shield',
  },
  president: {
    id: 'president',
    name: { en: 'President', fr: 'Président' },
    level: 9,
    permissions: ['admin.users.manage', 'admin.roles.assign', 'dashboard.access', 'dashboard.admin', 'content.create', 'content.edit.all', 'profile.edit', 'profile.edit.others', 'membership.manage'],
    color: 'text-red-500',
    icon: 'Crown',
  },
};

// Role par defaut pour les nouveaux users
export const DEFAULT_ROLE = 'nouveau_membre';

// Roles qui peuvent attribuer des roles
export const ROLES_WITH_ASSIGN_PERMISSION = ['president', 'admin_general', 'chef_pole'];

// Roles avec acces dashboard admin
export const ADMIN_ROLES = ['president', 'admin_general', 'chef_pole'];

// Obtenir le role par defaut
export function getDefaultRole(): RoleDefinition {
  return ROLES[DEFAULT_ROLE];
}

// Verifier si un roleId est valide
export function isValidRole(roleId: string): roleId is keyof typeof ROLES {
  return roleId in ROLES;
}
