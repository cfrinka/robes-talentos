import 'server-only';
import { cookies } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from './firebase/admin';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days, mirrors createSessionCookie's expiresIn below

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email === process.env.ADMIN_EMAIL;
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export async function verifySession(sessionCookie: string): Promise<DecodedIdToken | null> {
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

/**
 * Guards every mutating Server Action / Route Handler in the admin panel.
 * The proxy already blocks unauthenticated navigation to /admin/**, but
 * Server Actions are independently callable endpoints, so each one re-checks
 * the session here rather than trusting the proxy alone.
 */
export async function requireAdmin(): Promise<DecodedIdToken> {
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE_NAME)?.value;
  const decoded = sessionCookie ? await verifySession(sessionCookie) : null;

  if (!decoded || !isAdminEmail(decoded.email)) {
    throw new Error('Unauthorized');
  }

  return decoded;
}
