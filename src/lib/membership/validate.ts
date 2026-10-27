export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeWhatsapp(value: string) {
  const trimmed = value.trim();
  const plus = trimmed.startsWith('+') || trimmed.startsWith('00');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;
  if (trimmed.startsWith('00') && digits.length > 2) return `+${digits.slice(2)}`;
  if (plus && !trimmed.startsWith('+')) return `+${digits}`;
  return plus ? `+${digits}` : digits;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value);
}

export function isValidWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function applicationPayload(body: Record<string, unknown>) {
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const email = normalizeEmail(String(body.email ?? ''));
  const whatsapp = normalizeWhatsapp(String(body.whatsapp ?? ''));
  const motivations = String(body.motivations ?? '').trim();
  return { firstName, lastName, email, whatsapp, motivations };
}
