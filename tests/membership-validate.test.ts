import { describe, expect, it } from 'vitest';
import {
  applicationPayload,
  isValidEmail,
  isValidWhatsapp,
  normalizeWhatsapp,
} from '@/lib/membership/validate';

describe('membership validation', () => {
  it('accepts a Benin WhatsApp number with the 01 prefix', () => {
    expect(isValidWhatsapp('+2290140550527')).toBe(true);
    expect(normalizeWhatsapp('+229 01 40 55 05 27')).toBe('+2290140550527');
  });

  it('accepts the Epitech email from the join form', () => {
    expect(isValidEmail('salvador.sossou@epitech.eu')).toBe(true);
  });

  it('ignores extra body fields', () => {
    const payload = applicationPayload({
      firstName: ' Carlos ',
      lastName: 'SOSSOU',
      email: 'salvador.sossou@epitech.eu',
      whatsapp: '+2290140550527',
      motivations: 'Rejoindre Epi’AI',
      id: 'not-a-uuid',
      status: 'approved',
    });
    expect(payload).toEqual({
      firstName: 'Carlos',
      lastName: 'SOSSOU',
      email: 'salvador.sossou@epitech.eu',
      whatsapp: '+2290140550527',
      motivations: 'Rejoindre Epi’AI',
    });
  });
});
