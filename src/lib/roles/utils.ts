import { ROLES, ADMIN_ROLES, ROLES_WITH_ASSIGN_PERMISSION, isValidRole as isValidRoleDef, LEGACY_ROLE_ALIASES } from './definitions';
import type { RoleDefinition, Permission, RoleLevel } from './types';

// Re-export isValidRole
export const isValidRole = isValidRoleDef;

/** Normalise un slug legacy (ex. nouveau_membre → membre). */
export function normalizeRoleSlug(roleId: string | undefined): string {
  if (!roleId) return '';
  if (isValidRole(roleId)) return roleId;
  const alias = LEGACY_ROLE_ALIASES[roleId];
  return alias && isValidRole(alias) ? alias : '';
}

/** Résout le slug de rôle depuis les publicMetadata Clerk (role string ou roleId numérique legacy). */
export function resolveRoleSlug(
  metadata: Record<string, unknown> | null | undefined
): string {
  if (!metadata) return '';

  const role = metadata.role as string | undefined;
  if (role) {
    const normalized = normalizeRoleSlug(role);
    if (normalized) return normalized;
  }

  const roleId = metadata.roleId;
  if (typeof roleId === 'string') {
    const normalized = normalizeRoleSlug(roleId);
    if (normalized) return normalized;
  }

  const level = typeof roleId === 'number' ? roleId : Number(roleId);
  if (!Number.isNaN(level) && level > 0) {
    // Legacy: ancien « membre » était niveau 2 avant fusion des rôles
    if (level === 2 && role !== 'membre_equipe' && role !== 'chef_equipe') {
      return 'membre';
    }
    const found = Object.values(ROLES).find((r) => r.level === level);
    if (found) return found.id;
  }

  return '';
}

// Verifier si un utilisateur a une permission
export function hasPermission(
  roleId: string | undefined,
  permission: Permission
): boolean {
  const slug = normalizeRoleSlug(roleId) || roleId;
  if (!slug || !isValidRole(slug)) return false;
  const role = ROLES[slug];
  return role?.permissions.includes(permission) ?? false;
}

// Verifier si le role A est superieur au role B
export function isRoleHigher(roleIdA: string, roleIdB: string): boolean {
  const a = normalizeRoleSlug(roleIdA) || roleIdA;
  const b = normalizeRoleSlug(roleIdB) || roleIdB;
  if (!isValidRole(a) || !isValidRole(b)) return false;
  const levelA = ROLES[a]?.level ?? 0;
  const levelB = ROLES[b]?.level ?? 0;
  return levelA > levelB;
}

// Verifier si le role A est superieur ou egal au role B
export function isRoleHigherOrEqual(roleIdA: string, roleIdB: string): boolean {
  const a = normalizeRoleSlug(roleIdA) || roleIdA;
  const b = normalizeRoleSlug(roleIdB) || roleIdB;
  if (!isValidRole(a) || !isValidRole(b)) return false;
  const levelA = ROLES[a]?.level ?? 0;
  const levelB = ROLES[b]?.level ?? 0;
  return levelA >= levelB;
}

// Recuperer le niveau du role
export function getRoleLevel(roleId: string): number {
  const slug = normalizeRoleSlug(roleId) || roleId;
  if (!isValidRole(slug)) return 0;
  return ROLES[slug]?.level ?? 0;
}

// Recuperer la definition du role
export function getRoleDefinition(roleId: string): RoleDefinition | undefined {
  const slug = normalizeRoleSlug(roleId) || roleId;
  return isValidRole(slug) ? ROLES[slug] : undefined;
}

// Recuperer le nom du role dans la langue specifiee
export function getRoleName(roleId: string, locale: 'en' | 'fr'): string {
  const slug = normalizeRoleSlug(roleId) || roleId;
  if (!isValidRole(slug)) return locale === 'fr' ? 'Membre' : 'Member';
  return ROLES[slug]?.name[locale] ?? (locale === 'fr' ? 'Membre' : 'Member');
}

// Recuperer la couleur du role
export function getRoleColor(roleId: string): string {
  const slug = normalizeRoleSlug(roleId) || roleId;
  if (!isValidRole(slug)) return 'text-gray-400';
  return ROLES[slug]?.color ?? 'text-gray-400';
}

// Recuperer l'icone du role
export function getRoleIcon(roleId: string): string {
  const slug = normalizeRoleSlug(roleId) || roleId;
  if (!isValidRole(slug)) return 'User';
  return ROLES[slug]?.icon ?? 'User';
}

// Verifier si le role est un role admin (acces dashboard admin)
export function isAdminRole(roleId: string): boolean {
  const slug = normalizeRoleSlug(roleId) || roleId;
  return ADMIN_ROLES.includes(slug);
}

// Verifier si le role peut attribuer des roles
export function canAssignRoles(roleId: string): boolean {
  const slug = normalizeRoleSlug(roleId) || roleId;
  return ROLES_WITH_ASSIGN_PERMISSION.includes(slug);
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
