import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, isAdminEmail, verifySession } from '@/lib/auth';

// Server-enforced guard for /admin/** (except /admin/login), replacing the
// old client-only redirect-after-mount check (public/admin-js/auth-guard.js),
// which only ran after the HTML had already loaded. Proxy runs on the
// Node.js runtime by default in Next 16, so firebase-admin works here too.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const decoded = sessionCookie ? await verifySession(sessionCookie) : null;

  if (!decoded || !isAdminEmail(decoded.email)) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
