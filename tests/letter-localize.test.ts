import { describe, expect, it } from 'vitest';
import { lexiconFocusToEnglish, lexiconRoleToEnglish } from '@/lib/letters/localize-fields';
import { letterFilename } from '@/lib/letters/recommendation';
import { contractClauses, dueStatusLabel } from '@/lib/modules/contract';
import { teamRoleLabel } from '@/lib/team/role-labels';

describe('teamRoleLabel', () => {
  it('maps bureau roles to English', () => {
    expect(teamRoleLabel('Responsable Communication', 'en')).toBe('Head of Communications');
    expect(teamRoleLabel('Président', 'en')).toBe('President');
  });
});

describe('lexiconRoleToEnglish', () => {
  it('translates known roles and commissions', () => {
    expect(lexiconRoleToEnglish('Responsable Communication')).toBe('Head of Communications');
    expect(lexiconRoleToEnglish('Membre, commission Projets')).toMatch(/Member/i);
    expect(lexiconRoleToEnglish('Membre, commission Projets')).toMatch(/AI projects/i);
  });
});

describe('lexiconFocusToEnglish', () => {
  it('maps the default French focus', () => {
    expect(lexiconFocusToEnglish("l'intelligence artificielle")).toBe('artificial intelligence');
  });
});

describe('letterFilename', () => {
  it('uses the letter language in the file name', () => {
    expect(letterFilename('Ange', 'Adantchede', 'fr')).toContain('Lettre_de_recommandation');
    expect(letterFilename('Ange', 'Adantchede', 'en')).toContain('Letter_of_recommendation');
  });
});

describe('workspace copy', () => {
  it('returns English contract clauses', () => {
    const en = contractClauses('en');
    expect(en.some((clause) => /monthly membership fee/i.test(clause))).toBe(true);
    expect(en.some((clause) => /Je m'engage/i.test(clause))).toBe(false);
  });

  it('labels due statuses in English', () => {
    expect(dueStatusLabel('late', 'en')).toBe('late');
    expect(dueStatusLabel('late', 'fr')).toBe('en retard');
    expect(dueStatusLabel('paid', 'en')).toBe('paid');
  });
});
