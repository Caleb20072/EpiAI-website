import { describe, it, expect } from 'vitest';
import { hasPermission, normalizeRoleSlug, resolveRoleSlug } from '@/lib/roles/utils';
import type { Permission } from '@/lib/roles/types';

const cases: [string, Permission, boolean][] = [
  ['president', 'membership.manage', true],
  ['admin_general', 'membership.manage', true],
  ['chef_pole', 'membership.manage', true],
  ['membre', 'membership.manage', false],
  ['membre', 'content.create', false],
  ['membre_equipe', 'content.create', true],
  ['logistique', 'activities.create', true],
  ['membre', 'activities.create', false],
  ['president', 'attendance.manage', true],
  ['membre_equipe', 'attendance.manage', false],
];

describe('API permission matrix', () => {
  it.each(cases)('role %s permission %s => %s', (role, perm, expected) => {
    expect(hasPermission(role, perm)).toBe(expected);
  });
});

describe('legacy role aliases', () => {
  it('maps nouveau_membre to membre', () => {
    expect(normalizeRoleSlug('nouveau_membre')).toBe('membre');
    expect(resolveRoleSlug({ role: 'nouveau_membre' })).toBe('membre');
  });
});
