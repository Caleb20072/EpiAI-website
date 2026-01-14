// Type pour les niveaux de role (1-9)
export type RoleLevel =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Definition du role
export interface RoleDefinition {
  id: string;
  name: {
    en: string;
    fr: string;
  };
  level: RoleLevel;
  permissions: string[];
  color: string;
  icon: string;
}

// Metadata Clerk attendu pour les users
export interface ClerkUserMetadata {
  roleId?: string;
  teamId?: string;
  poleId?: string;
  joinedAt?: string;
}

// Type pour les permissions
export type Permission =
  | 'admin.users.manage'
  | 'admin.roles.assign'
  | 'membership.manage'
  | 'resources.manage'
  | 'resources.create'
  | 'content.create'
  | 'content.edit.own'
  | 'content.edit.all'
  | 'dashboard.access'
  | 'dashboard.admin'
  | 'profile.edit'
  | 'profile.edit.others';

// Roles disponibles
export const ROLE_IDS = {
  PRESIDENT: 'president',
  ADMIN_GENERAL: 'admin_general',
  CHEF_POLE: 'chef_pole',
  MENTOR_SENIOR: 'mentor_senior',
  MENTOR: 'mentor',
  CHEF_EQUIPE: 'chef_equipe',
  MEMBRE_EQUIPE: 'membre_equipe',
  MEMBRE: 'membre',
  NOUVEAU_MEMBRE: 'nouveau_membre',
} as const;

export type RoleId = typeof ROLE_IDS[keyof typeof ROLE_IDS];
