# Robes Britto

Next.js 16 (App Router, TypeScript) rebuild of the Robes Britto talent agency site — public marketing pages plus a native admin panel, both backed by Firestore/Firebase Storage. Ported from the original Astro app; see `NEXTJS_MIGRATION.md` for the original migration spec this was built against.

## Stack

- **Next.js 16**, App Router, TypeScript, plain CSS (`app/globals.css`, ported verbatim from the Astro site).
- **Firebase**: `firebase-admin` for all server-side Firestore/Storage access; the client `firebase` SDK is used only by the admin login page and the dashboard's Publish button.
- Two route groups under `app/`: `(site)` (the public marketing site, its own root layout) and `admin` (the admin panel, its own root layout + `admin.css`).

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your Firebase project's service account + web config (see comments in that file for where to find each value).

Open [http://localhost:3000](http://localhost:3000) for the public site, or `/admin/login` for the admin panel (single allowed admin email, set via `ADMIN_EMAIL`).

## Architecture

- `lib/content/repository.ts` — cached, public reads (`unstable_cache`, tagged by entity) used by the marketing site.
- `lib/content/admin-repository.ts` — live, uncached Firestore CRUD used by the admin panel, so edits show up immediately without waiting on cache invalidation.
- `lib/actions/*.ts` — Server Actions for every admin mutation, each re-checking the session server-side via `lib/auth.ts`'s `requireAdmin()`.
- `proxy.ts` — guards `/admin/**` (except `/admin/login`) by verifying the session cookie set by `app/api/auth/session/route.ts`.
- Admin edits save to Firestore immediately, but the public site keeps serving cached content until the dashboard's "Publicar" button calls `app/api/publish/route.ts`, which revalidates every content tag.

## Deployment

`Dockerfile` builds a single Next.js standalone image (`output: 'standalone'` in `next.config.ts`); `docker-compose.yml` runs it as one service on port 3000. No separate publish/build service is needed — Publish is just a Route Handler call.
