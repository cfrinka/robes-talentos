// Accent-stripping ASCII slugifier, ported verbatim from the Astro admin's
// public/admin-js/slugify.js so generated slugs match existing Firestore data.
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
