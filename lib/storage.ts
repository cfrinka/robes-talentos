import 'server-only';
import { randomUUID } from 'node:crypto';
import { adminBucket } from './firebase/admin';

// Server-side replacement for the admin UI's old client-SDK direct upload
// (public/admin-js/upload.js). Keeps the same `${folder}/${uuid}-${filename}`
// path convention and produces the same download-URL shape the client SDK's
// getDownloadURL() would have returned, so old and new uploads stay
// interchangeable in Firestore.
export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const token = randomUUID();
  const path = `${folder}/${randomUUID()}-${file.name}`;
  const storageFile = adminBucket.file(path);

  await storageFile.save(buffer, {
    metadata: {
      contentType: file.type || 'application/octet-stream',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${adminBucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}
