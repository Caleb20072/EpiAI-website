import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

function secret() {
  return process.env.CRON_SECRET || process.env.CLERK_SECRET_KEY || 'epiai-exam-dev';
}

export function generateExamLogin() {
  return `epiai-${randomBytes(4).toString('hex')}`;
}

export function generateExamPassword() {
  return randomBytes(9).toString('base64url');
}

export function hashPassword(plain: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const next = scryptSync(plain, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function signExamSession(payload: { bookingId: string; attemptId: string; exp: number }) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function readExamSession(token: string | undefined | null): {
  bookingId: string;
  attemptId: string;
  exp: number;
} | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      bookingId: string;
      attemptId: string;
      exp: number;
    };
    if (!payload.bookingId || !payload.attemptId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function fingerprint(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 12);
}

export const EXAM_COOKIE = 'epiai_exam_session';
