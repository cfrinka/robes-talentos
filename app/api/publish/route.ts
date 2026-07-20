import { revalidateTag } from 'next/cache';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/auth';
import { CONTENT_TAGS } from '@/lib/content/repository';

// Replaces publish-server/server.js's `npm run build` + dist swap: the
// dashboard's "Publicar" button calls this with a Firebase ID token, and a
// successful call invalidates every cached public-content tag so the next
// visit to any page re-reads Firestore. Uses `{ expire: 0 }` (immediate
// expiration) rather than the `'max'` stale-while-revalidate profile,
// because "Publicar" is meant to make edits visible right away, not
// eventually.
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!isAdminEmail(decoded.email)) {
    return new Response('Forbidden', { status: 403 });
  }

  for (const tag of CONTENT_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }

  return new Response('Published', { status: 200 });
}
