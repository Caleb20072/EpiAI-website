import { describe, expect, it } from 'vitest';
import { autoScoreAnswer, normalizeAnswer } from '@/lib/admission/grade';

describe('autoScoreAnswer', () => {
  it('matches accent-insensitive short answers', () => {
    expect(
      autoScoreAnswer({ type: 'short', officialAnswer: 'Péniel', response: 'peniel', points: 2 }),
    ).toBe(2);
  });

  it('accepts alternate answers separated by |', () => {
    expect(
      autoScoreAnswer({ type: 'blank', officialAnswer: 'oui | yes', response: 'YES', points: 1 }),
    ).toBe(1);
  });

  it('scores numeric answers', () => {
    expect(
      autoScoreAnswer({ type: 'numeric', officialAnswer: '3,14', response: '3.14', points: 4 }),
    ).toBe(4);
  });

  it('returns 0 when empty', () => {
    expect(autoScoreAnswer({ type: 'short', officialAnswer: 'a', response: '', points: 1 })).toBe(0);
  });
});

describe('normalizeAnswer', () => {
  it('strips diacritics', () => {
    expect(normalizeAnswer('Égalité')).toBe('egalite');
  });
});
