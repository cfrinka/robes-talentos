import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS, createSessionCookie, isAdminEmail } from '@/lib/auth';

// Exchanges a freshly-signed-in Firebase ID token for an httpOnly session
// cookie, so the admin route guard (proxy.ts) can verify the session
// server-side on every request instead of trusting a client-only redirect.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== 'string') {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (!isAdminEmail(decoded.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sessionCookie = await createSessionCookie(idToken);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
