'use client';

// Shared by every admin image field: uploads a File to /api/upload (which
// does the actual Firebase Storage write server-side, see lib/storage.ts)
// and returns the public download URL.
export async function uploadViaApi(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    throw new Error((await res.text()) || 'Falha ao enviar imagem.');
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}
