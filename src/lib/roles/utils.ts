import { ROLES, ADMIN_ROLES, ROLES_WITH_ASSIGN_PERMISSION, isValidRole } from './definitions';
import type { RoleDefinition, Permission, RoleLevel } from './types';

// Verifier si un utilisateur a une permission
export function hasPermission(
  roleId: string | undefined,
  permission: Permission
): boolean {
  if (!roleId || !isValidRole(roleId)) return false;
  const role = ROLES[roleId];
  return role?.permissions.includes(permission) ?? false;
}

// Verifier si le role A est superieur au role B
export function isRoleHigher(roleIdA: string, roleIdB: string): boolean {
  if (!isValidRole(roleIdA) || !isValidRole(roleIdB)) return false;
  const levelA = ROLES[roleIdA]?.level ?? 0;
  const levelB = ROLES[roleIdB]?.level ?? 0;
  return levelA > levelB;
}

// Verifier si le role A est superieur ou egal au role B
export function isRoleHigherOrEqual(roleIdA: string, roleIdB: string): boolean {
  if (!isValidRole(roleIdA) || !isValidRole(roleIdB)) return false;
  const levelA = ROLES[roleIdA]?.level ?? 0;
  const levelB = ROLES[roleIdB]?.level ?? 0;
  return levelA >= levelB;
}

// Recuperer le niveau du role
export function getRoleLevel(roleId: string): number {
  if (!isValidRole(roleId)) return 0;
  return ROLES[roleId]?.level ?? 0;
}

// Recuperer la definition du role
export function getRoleDefinition(roleId: string): RoleDefinition | undefined {
  return ROLES[roleId];
}

// Recuperer le nom du role dans la langue specifiee
export function getRoleName(roleId: string, locale: 'en' | 'fr'): string {
  if (!isValidRole(roleId)) return locale === 'fr' ? 'Membre' : 'Member';
  return ROLES[roleId]?.name[locale] ?? (locale === 'fr' ? 'Membre' : 'Member');
}

// Recuperer la couleur du role
export function getRoleColor(roleId: string): string {
  if (!isValidRole(roleId)) return 'text-gray-400';
  return ROLES[roleId]?.color ?? 'text-gray-400';
}

// Recuperer l'icone du role
export function getRoleIcon(roleId: string): string {
  if (!isValidRole(roleId)) return 'User';
  return ROLES[roleId]?.icon ?? 'User';
}

// Verifier si le role est un role admin (acces dashboard admin)
export function isAdminRole(roleId: string): boolean {
  return ADMIN_ROLES.includes(roleId);
}

// Verifier si le role peut attribuer des roles
export function canAssignRoles(roleId: string): boolean {
  return ROLES_WITH_ASSIGN_PERMISSION.includes(roleId);
}

// Recuperer tous les roles sous forme de tableau ordonne par niveau
export function getRolesOrderedByLevel(): RoleDefinition[] {
  return Object.values(ROLES).sort((a, b) => a.level - b.level);
}

// Recuperer la liste des permissions disponibles
export function getAllPermissions(): Permission[] {
  return [
    'admin.users.manage',
    'admin.roles.assign',
    'membership.manage',
    'resources.manage',
    'resources.create',
    'content.create',
    'content.edit.own',
    'content.edit.all',
    'dashboard.access',
    'dashboard.admin',
    'profile.edit',
    'profile.edit.others',
  ];
}
