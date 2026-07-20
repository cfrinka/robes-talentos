import { requireAdmin } from '@/lib/auth';
import { adminDb } from '@/lib/firebase/admin';

// Server-Sent Events stream of the "novo" count across castingApplications +
// talentInquiries, so the Mensagens nav badge updates live instead of only
// on navigation. Uses firebase-admin's onSnapshot (a real-time listener,
// same API shape as the client SDK) rather than polling -- this app is a
// single long-running Node process (see Dockerfile/docker-compose.yml, no
// serverless execution-time limit), so holding the connection open is fine.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  let applicationsCount = 0;
  let inquiriesCount = 0;

  let unsubscribeApplications: () => void = () => undefined;
  let unsubscribeInquiries: () => void = () => undefined;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      function send() {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${applicationsCount + inquiriesCount}\n\n`));
        } catch {
          closed = true;
        }
      }

      unsubscribeApplications = adminDb
        .collection('castingApplications')
        .where('status', '==', 'novo')
        .onSnapshot(
          (snap) => {
            applicationsCount = snap.size;
            send();
          },
          () => undefined
        );

      unsubscribeInquiries = adminDb
        .collection('talentInquiries')
        .where('status', '==', 'novo')
        .onSnapshot(
          (snap) => {
            inquiriesCount = snap.size;
            send();
          },
          () => undefined
        );

      request.signal.addEventListener('abort', () => {
        closed = true;
        unsubscribeApplications();
        unsubscribeInquiries();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      unsubscribeApplications();
      unsubscribeInquiries();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
