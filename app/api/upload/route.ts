import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImageToStorage } from '@/lib/storage';

// Server-side replacement for the admin UI's old client-SDK direct-to-Storage
// upload (public/admin-js/upload.js): the browser no longer needs Storage
// write access at all, tightening storage.rules is now possible.
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = formData.get('folder');

  if (!(file instanceof File) || typeof folder !== 'string' || !folder) {
    return NextResponse.json({ error: 'Missing file or folder' }, { status: 400 });
  }

  try {
    const url = await uploadImageToStorage(file, folder);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
