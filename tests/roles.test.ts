import { describe, it, expect } from 'vitest';
import { resolveRoleSlug, hasPermission } from '@/lib/roles/utils';

describe('resolveRoleSlug', () => {
  it('returns role string when present', () => {
    expect(resolveRoleSlug({ role: 'president' })).toBe('president');
  });

  it('maps numeric roleId to slug', () => {
    expect(resolveRoleSlug({ roleId: 9 })).toBe('president');
    expect(resolveRoleSlug({ roleId: '8' })).toBe('admin_general');
  });

  it('returns empty string when no role info', () => {
    expect(resolveRoleSlug({})).toBe('');
  });
});

describe('hasPermission', () => {
  it('grants president full access', () => {
    expect(hasPermission('president', 'membership.manage')).toBe(true);
  });

  it('denies membre admin actions', () => {
    expect(hasPermission('membre', 'membership.manage')).toBe(false);
    expect(hasPermission('membre', 'content.create')).toBe(false);
  });

  it('maps legacy nouveau_membre slug', () => {
    expect(resolveRoleSlug({ role: 'nouveau_membre' })).toBe('membre');
  });
});
