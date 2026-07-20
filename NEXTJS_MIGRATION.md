# Robes Britto — Next.js Rebuild Guide

This is the implementation spec for rebuilding the current Astro site (static, `output: 'static'`, Firestore-backed via a build-time switch + a separate `publish-server` Docker service) as a single Next.js app, with the admin panel built natively in Next.js (React) instead of the current vanilla-JS `/public/admin-js`.

**Goal: pixel-for-pixel same design, same animations, same features.** Every color, font, spacing value, keyframe, and breakpoint below is copied verbatim from the current `src/styles/global.css` (322 lines) — do not "clean up" or reinterpret it. Copy it into Next.js almost unchanged.

## Decisions made (confirmed with the project owner)

1. **Keep Firebase.** Same Firestore project (`robes-d2df2`), same collections/fields, same Storage bucket, same Firebase Auth single-admin-email model. No data migration needed — the existing seeded content stays valid.
2. **Keep the explicit "Publicar" (Publish) step**, not fully-live ISR. Admin edits write to Firestore immediately (as today), but the *public* site only reflects those changes after clicking Publish. The mechanism changes: instead of `publish-server` running `astro build` + swapping a Docker volume, Publish becomes a Next.js **on-demand revalidation** call (`revalidateTag`/`revalidatePath`). This keeps the exact same UX/mental model the owner is used to, while deleting the Express service, the Docker dist-swap dance, and the local-seed/Firebase build-time source switch — all replaced by one Server Action.

---

## 1. Stack

- **Next.js 15, App Router, TypeScript.**
- **Plain CSS**, not Tailwind — port `global.css` almost verbatim into `app/globals.css` plus a handful of CSS Modules only where useful for admin-only styling. The existing design is not utility-class-based; forcing it into Tailwind risks subtle drift from "same exact design." Keep it as-is.
- **`next/font/google`** for Montserrat (weights 300/400/500/600) and Inter (weights 400/500/600), replacing the `<link>`-based Google Fonts load in `BaseLayout.astro`.
- **Firebase**: `firebase` (client SDK, for the admin UI: Auth + Storage upload) and `firebase-admin` (server SDK, for reading/writing Firestore in Server Components / Route Handlers / Server Actions).
- **Deploy**: Node standalone output (`output: 'standalone'` in `next.config.js`) in a single Docker image behind nginx (or Vercel — see §12). This removes the second (`publish-server`) container entirely.

```bash
npx create-next-app@latest robes-britto --typescript --app --no-tailwind --eslint
cd robes-britto
npm install firebase firebase-admin
```

---

## 2. Project structure

```
app/
  layout.tsx                 # <html>/<body>, fonts, CustomCursor/Header/FullscreenMenu/Footer/ScrollReveal
  globals.css                 # ported 1:1 from src/styles/global.css
  page.tsx                    # / (home)
  talentos/
    page.tsx                  # /talentos (listing + filter sidebar)
    [slug]/page.tsx            # /talentos/[slug] (profile)
  editorial/
    page.tsx                  # /editorial (listing + tabs)
    [slug]/page.tsx            # /editorial/[slug] (article detail)
  castings/page.tsx           # /castings (list + apply modal)
  sobre/page.tsx               # /sobre
  contato/page.tsx             # /contato
  admin/
    layout.tsx                # AdminLayout equivalent: nav bar, protected by middleware
    login/page.tsx
    page.tsx                  # dashboard ("Publicar" button)
    talentos/page.tsx          # list
    talentos/edit/page.tsx     # create/edit (?id=)
    castings/page.tsx
    castings/edit/page.tsx
    editorial/page.tsx
    editorial/edit/page.tsx    # includes block repeater (paragraph/image)
    categorias/page.tsx
    categorias/edit/page.tsx
    site-settings/page.tsx     # singleton
    home-page/page.tsx         # singleton
    about-page/page.tsx        # singleton, with stats + values repeaters
  api/
    publish/route.ts           # POST: verifies admin ID token, calls revalidateTag('content')
    upload/route.ts            # POST: server-side image upload to Storage (keeps Storage rules tight)

components/
  layout/
    Header.tsx
    FullscreenMenu.tsx
    Footer.tsx
    CustomCursor.tsx
    ScrollReveal.tsx           # wraps children, or a client hook used per-section
  talent/
    TalentCard.tsx
    TalentGrid.tsx
  article/ArticleCard.tsx
  casting/CastingCard.tsx
  ui/CategoryTile.tsx
  talent/TalentFilterBar.tsx   # client component (was an Astro island)
  talent/TalentGallery.tsx     # client component (was an Astro island)
  casting/ApplyModal.tsx       # client component

lib/
  firebase/client.ts           # firebase client SDK init (admin UI only)
  firebase/admin.ts            # firebase-admin init (server-only, Server Components/Actions)
  content/types.ts             # ported 1:1 from src/content/types.ts
  content/repository.ts        # server-only Firestore reads, replaces content-source.ts + repositories/
  auth.ts                      # requireAdmin() helper for Server Actions/Route Handlers
  slugify.ts                   # ported from public/admin-js/slugify.js

middleware.ts                  # protects /admin/** except /admin/login, checks Firebase session cookie
```

---

## 3. Design tokens & global CSS

Create `app/globals.css` with this content, copied verbatim from the current `src/styles/global.css`. **Do not modify values** — every hex code, `clamp()`, keyframe percentage, and breakpoint below is load-bearing for "same exact design":

```css
:root{--ink:#111110;--paper:#faf9f6;--charcoal:#1a1918;--stone:#e8e4de;--line:rgba(17,17,16,.14);--accent:#e5217c;--font-d:'Montserrat',sans-serif;--font-b:'Inter',sans-serif}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-b);color:var(--ink);background:var(--paper)}
a{color:inherit;text-decoration:none}
h1,h2,p{margin:0}

/* header */
.site-header{position:fixed;top:0;left:0;right:0;height:84px;background:var(--paper);display:flex;align-items:center;justify-content:space-between;padding:0 48px;z-index:100;border-bottom:1px solid var(--line)}
.menu-btn{width:26px;height:16px;display:flex;flex-direction:column;justify-content:space-between;background:none;border:none;padding:0;cursor:pointer}
.menu-btn span{display:block;height:1px;background:var(--ink);width:100%}
.menu-btn span:last-child{width:70%}
.logo{font-family:var(--font-d);font-weight:300;font-size:27px;letter-spacing:.01em}
.logo.small{font-size:22px;margin-bottom:16px;display:block}
.accent{color:var(--accent)}
.header-region{width:26px;font:11px/1 var(--font-b);letter-spacing:.08em;color:rgba(17,17,16,.4);text-transform:uppercase;text-align:right}

/* fullscreen menu */
@keyframes envelope-open{
  0%{clip-path:polygon(50% 0%,50% 0%,50% 0%,50% 0%)}
  45%{clip-path:polygon(0% 0%,100% 0%,50% 40%,50% 40%)}
  100%{clip-path:polygon(0% 0%,100% 0%,100% 100%,0% 100%)}
}
@keyframes envelope-close{
  0%{clip-path:polygon(0% 0%,100% 0%,100% 100%,0% 100%)}
  55%{clip-path:polygon(0% 0%,100% 0%,50% 40%,50% 40%)}
  100%{clip-path:polygon(50% 0%,50% 0%,50% 0%,50% 0%)}
}
.fullscreen-menu{position:fixed;inset:0;background:var(--charcoal);z-index:200;display:flex;flex-direction:column;justify-content:space-between;padding:56px 48px;color:var(--paper);visibility:hidden;clip-path:polygon(50% 0%,50% 0%,50% 0%,50% 0%)}
.fullscreen-menu.open{visibility:visible;animation:envelope-open .7s cubic-bezier(.65,0,.35,1) forwards}
.fullscreen-menu.closing{visibility:visible;animation:envelope-close .5s cubic-bezier(.65,0,.35,1) forwards}
.menu-top{display:flex;justify-content:flex-end}
.menu-close{background:none;border:none;color:inherit;font:15px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.menu-links{display:flex;flex-direction:column;gap:18px}
.menu-links a{font-family:var(--font-d);font-weight:300;font-size:clamp(32px,6vw,64px);color:inherit;width:fit-content}
.menu-links a:hover{color:var(--accent)}
.menu-bottom{display:flex;justify-content:space-between;align-items:flex-end;font:12px/1.4 var(--font-b);letter-spacing:.04em;color:rgba(250,249,246,.5)}
.menu-social{display:flex;gap:20px;text-transform:uppercase}

main{padding-top:84px}

/* placeholders */
.placeholder{position:relative;background:var(--stone);overflow:hidden}
.placeholder::before{content:'';position:absolute;inset:0;background-image:repeating-linear-gradient(135deg,rgba(17,17,16,.06) 0,rgba(17,17,16,.06) 1px,transparent 1px,transparent 11px)}
.placeholder.dark{background:var(--charcoal)}
.placeholder.dark::before{background-image:repeating-linear-gradient(135deg,rgba(250,249,246,.045) 0,rgba(250,249,246,.045) 1px,transparent 1px,transparent 12px)}
.ph-4-5{aspect-ratio:4/5}
.ph-3-4{aspect-ratio:3/4}
.ph-16-9{aspect-ratio:16/9}
.ph-4-3{aspect-ratio:4/3}
.placeholder.has-img::before{content:none}
.ph-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
.talent-card:hover .ph-img{transform:scale(1.05)}

/* hero */
.hero{position:relative;height:88vh;min-height:560px;background:var(--charcoal);overflow:hidden;display:flex;align-items:flex-end}
.hero::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.8),rgba(0,0,0,.15) 60%)}
.hero-content{position:relative;z-index:1;padding:0 48px 72px;max-width:900px}
.kicker{font:12px/1 var(--font-b);letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:20px}
.hero-content h1{font-family:var(--font-d);font-weight:300;font-size:clamp(38px,6vw,80px);line-height:1.05;color:var(--paper);margin:0 0 32px}
.btn-outline-light{display:inline-block;background:none;border:1px solid var(--paper);color:var(--paper);padding:16px 32px;font:13px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;transition:.3s;cursor:pointer}
.btn-outline-light:hover{background:var(--paper);color:var(--ink)}

@keyframes fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.hero-content .kicker{opacity:0;animation:fade-up .8s ease .1s forwards}
.hero-content h1{opacity:0;animation:fade-up .9s ease .25s forwards}
.hero-content .btn-outline-light{opacity:0;animation:fade-up .9s ease .45s forwards}

/* scroll reveal */
.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease}
.reveal.reveal-visible{opacity:1;transform:translateY(0)}

/* custom cursor */
.cursor-dot{position:fixed;top:0;left:0;width:6px;height:6px;border-radius:50%;background:#fff;mix-blend-mode:difference;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:background .2s ease,opacity .2s ease}
.cursor-ring{position:fixed;top:0;left:0;width:34px;height:34px;border:1px solid #fff;mix-blend-mode:difference;border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .25s ease,height .25s ease,border-color .25s ease,background .25s ease,opacity .2s ease}
.cursor-dot.is-hover{background:var(--accent);mix-blend-mode:normal}
.cursor-ring.is-hover{width:52px;height:52px;border-color:var(--accent);background:rgba(229,33,124,.06);mix-blend-mode:normal}
@media (hover:hover) and (pointer:fine){
  body{cursor:none}
  a,button,input,textarea,.talent-card,.category-tile,.check-box{cursor:none}
}
@media (hover:none),(pointer:coarse){
  .cursor-dot,.cursor-ring{display:none}
}

/* about split */
.about-split{display:grid;grid-template-columns:1fr 1fr;gap:72px;padding:140px 48px;max-width:1400px;margin:0 auto;align-items:center}
.lead{font-family:var(--font-d);font-weight:300;font-size:clamp(22px,2.4vw,34px);line-height:1.4;margin:0 0 24px}
.body-text{font:15px/1.8 var(--font-b);color:rgba(17,17,16,.65);max-width:480px}

/* sections */
.section{padding:0 48px 140px;max-width:1400px;margin:0 auto}
.section h2{font-family:var(--font-d);font-weight:300;font-size:clamp(28px,3vw,40px)}
.section-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:48px}
.link-arrow{font:12px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;transition:.2s;cursor:pointer}
.link-arrow:hover{color:var(--accent)}

/* talent cards */
.talent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:32px;margin-top:48px}
.section .talent-grid{margin-top:0}
.talent-card{display:block}
.talent-card .placeholder{margin-bottom:16px}
.talent-category{font:11px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.talent-name{font-family:var(--font-d);font-weight:400;font-size:19px;margin-bottom:4px}
.talent-meta{font:13px/1 var(--font-b);color:rgba(17,17,16,.5)}
.availability-badge{position:absolute;top:14px;right:14px;background:var(--paper);padding:5px 10px;font:10px/1 var(--font-b);letter-spacing:.05em;text-transform:uppercase;z-index:2}

/* categories */
.category-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:4px;margin-top:48px}
.category-tile{position:relative;aspect-ratio:3/4;background:var(--charcoal) center/cover no-repeat;overflow:hidden;display:block}
.category-tile::before{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.78),rgba(0,0,0,.1) 55%);transition:opacity .4s ease}
.category-tile:hover::before{opacity:.6}
.category-tile-label{position:absolute;left:20px;bottom:20px;font-family:var(--font-d);font-weight:300;font-size:24px;color:var(--paper);z-index:1}

/* articles */
.article-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:48px}
.section .article-grid{margin-top:0}
.article-card .placeholder{margin-bottom:20px}
.article-category{font:11px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.article-title{font-family:var(--font-d);font-weight:400;font-size:20px;line-height:1.3;margin-bottom:10px}
.article-excerpt{font:14px/1.6 var(--font-b);color:rgba(17,17,16,.55)}

/* castings */
.casting-list{display:flex;flex-direction:column;gap:1px;background:var(--line);margin-top:48px}
.section .casting-list{margin-top:0}
.casting-card{display:grid;grid-template-columns:220px 1fr;gap:40px;background:var(--paper);padding:32px 0}
.casting-type{font:11px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.casting-title{font-family:var(--font-d);font-weight:400;font-size:22px;margin-bottom:10px}
.casting-meta{font:13px/1.6 var(--font-b);color:rgba(17,17,16,.55);margin-bottom:8px;display:flex;gap:24px;flex-wrap:wrap}
.casting-deadline{font:12px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
.casting-description{font:14px/1.7 var(--font-b);color:rgba(17,17,16,.7);max-width:560px;margin:0 0 16px}
.casting-requirements,.casting-compensation{font:13px/1.7 var(--font-b);color:rgba(17,17,16,.6);max-width:560px;margin:0 0 8px}
.casting-requirements strong,.casting-compensation strong{color:rgba(17,17,16,.85);font-weight:600}
.casting-compensation{margin-bottom:20px}
.btn-dark{display:inline-block;background:var(--ink);color:var(--paper);border:none;padding:13px 26px;font:12px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:.2s}
.btn-dark:hover{background:var(--accent)}

/* casting application modal */
.apply-modal{position:fixed;inset:0;background:rgba(17,17,16,.7);z-index:300;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;transition:opacity .3s ease,visibility 0s linear .3s}
.apply-modal.open{opacity:1;visibility:visible;transition:opacity .3s ease,visibility 0s linear 0s}
.apply-modal-panel{background:var(--paper);width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:48px;position:relative;transform:translateY(16px);transition:transform .3s ease}
.apply-modal.open .apply-modal-panel{transform:translateY(0)}
.apply-modal-close{position:absolute;top:24px;right:24px;background:none;border:none;font:13px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;color:rgba(17,17,16,.55)}
.apply-modal-close:hover{color:var(--accent)}
.apply-modal-kicker{font:11px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.apply-modal-title{font-family:var(--font-d);font-weight:400;font-size:26px;margin-bottom:6px}
.apply-modal-deadline{font:12px/1 var(--font-b);letter-spacing:.04em;color:rgba(17,17,16,.5);margin-bottom:32px}
.apply-form{display:flex;flex-direction:column;gap:24px}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.field-file{width:100%;font:13px/1.4 var(--font-b);padding:12px 0}
.field-hint{font:12px/1.5 var(--font-b);color:rgba(17,17,16,.45);margin-top:6px}
.apply-form button[type="submit"]{align-self:flex-start;margin-top:8px}
.apply-success{text-align:center;padding:24px 0}
.apply-success-title{font-family:var(--font-d);font-weight:400;font-size:24px;margin-bottom:12px}
.apply-success-text{font:14px/1.7 var(--font-b);color:rgba(17,17,16,.65);max-width:400px;margin:0 auto}

/* talentos page */
.talentos-layout{padding:140px 48px 120px;max-width:1400px;margin:0 auto;display:grid;grid-template-columns:260px 1fr;gap:56px}
.filters h1{font-family:var(--font-d);font-weight:300;font-size:32px;margin:0 0 32px}
.search-input{width:100%;border:none;border-bottom:1px solid var(--ink);padding:10px 0;font:14px/1 var(--font-b);background:none;margin-bottom:40px;outline:none}
.filter-group{margin-bottom:36px}
.filter-label{font:12px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:rgba(17,17,16,.45);margin-bottom:16px}
.category-check{display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 0}
.check-box{width:15px;height:15px;border:1px solid var(--ink);flex-shrink:0;display:flex;align-items:center;justify-content:center}
.check-box .dot{width:7px;height:7px;background:var(--accent);display:none}
.category-check.active .dot{display:block}
.static-list{font:14px/2 var(--font-b);color:rgba(17,17,16,.75)}
.chip-row{display:flex;gap:8px;flex-wrap:wrap}
.chip{font:12px/1 var(--font-b);border:1px solid var(--line);padding:8px 12px}
.range-track{height:2px;background:var(--line);position:relative}
.range-fill{position:absolute;left:20%;right:30%;top:0;height:2px;background:var(--ink)}
.results-bar{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:32px;border-bottom:1px solid var(--line);padding-bottom:20px;font:13px/1 var(--font-b);color:rgba(17,17,16,.55)}
.pagination{display:flex;justify-content:center;gap:24px;font:13px/1 var(--font-b);color:rgba(17,17,16,.6);margin-top:56px}
.pagination .active{color:var(--ink);font-weight:600}

/* profile page */
.profile{padding:124px 48px 140px;max-width:1300px;margin:0 auto}
.back-link{font:12px/1 var(--font-b);letter-spacing:.05em;text-transform:uppercase;color:rgba(17,17,16,.55);display:inline-block;margin-bottom:32px;transition:.2s;cursor:pointer}
.back-link:hover{color:var(--accent)}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:start}
.gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:16px}
.profile-media .ph-4-5{margin-bottom:16px}
.gallery-main,.gallery-thumb{cursor:pointer}
.gallery-main:hover .ph-img,.gallery-thumb:hover .ph-img{transform:scale(1.04)}
.gallery-modal{--modal-pad:56px;position:fixed;inset:0;background:rgba(17,17,16,.94);z-index:300;display:flex;align-items:center;justify-content:center;padding:var(--modal-pad);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility 0s linear .3s}
.gallery-modal.open{opacity:1;visibility:visible;transition:opacity .3s ease,visibility 0s linear 0s}
.gallery-modal-img{max-width:calc(100vw - (var(--modal-pad) * 2));max-height:calc(100vh - (var(--modal-pad) * 2));width:auto;height:auto;object-fit:contain;transform:scale(.96);transition:transform .3s ease}
.gallery-modal.open .gallery-modal-img{transform:scale(1)}
.gallery-modal-close{position:absolute;top:32px;right:48px;background:none;border:none;color:var(--paper);font:13px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.gallery-modal-close:hover{color:var(--accent)}
.gallery-modal-counter{position:absolute;top:36px;left:48px;font:12px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:rgba(250,249,246,.55)}
.gallery-modal-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(250,249,246,.3);background:none;color:var(--paper);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s}
.gallery-modal-nav:hover{border-color:var(--accent);color:var(--accent)}
.gallery-modal-prev{left:24px}
.gallery-modal-next{right:24px}
.reel-section{margin-top:40px}
.video-placeholder{position:relative;aspect-ratio:16/9;background:var(--charcoal) center/cover no-repeat;display:flex;align-items:center;justify-content:center}
.video-placeholder::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,.4)}
.play-btn{position:relative;z-index:1;width:0;height:0;border-top:11px solid transparent;border-bottom:11px solid transparent;border-left:18px solid var(--paper)}
.video-time{position:absolute;z-index:1;bottom:16px;right:16px;font:11px/1 var(--font-b);color:rgba(250,249,246,.6)}
.profile-category{font:12px/1 var(--font-b);letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.profile-name{font-family:var(--font-d);font-weight:300;font-size:clamp(36px,4vw,56px);margin:0 0 12px;line-height:1.05}
.profile-meta{font:15px/1 var(--font-b);color:rgba(17,17,16,.55);margin-bottom:32px}
.profile-bio{font:16px/1.7 var(--font-b);color:rgba(17,17,16,.75);margin:0 0 36px}
.ficha-grid{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:28px 0;margin-bottom:36px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
.ficha-label{font:11px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:rgba(17,17,16,.45);margin-bottom:6px}
.ficha-value{font:15px/1 var(--font-b)}
.skills-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:40px}
.skill-chip{font:12px/1 var(--font-b);letter-spacing:.03em;border:1px solid var(--ink);padding:9px 16px}
.profile-actions{display:flex;gap:16px;flex-wrap:wrap}
.btn-accent{display:inline-block;background:var(--accent);color:var(--paper);border:none;padding:16px 30px;font:13px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:.2s}
.btn-accent:hover{opacity:.85}
.btn-outline-dark{display:inline-block;background:none;border:1px solid var(--ink);color:var(--ink);padding:16px 30px;font:13px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:.2s}
.btn-outline-dark:hover{background:var(--ink);color:var(--paper)}

/* castings page */
.castings-page{padding:140px 48px 140px;max-width:1100px;margin:0 auto}
.castings-page h1{font-family:var(--font-d);font-weight:300;font-size:clamp(32px,4vw,48px);margin:0 0 12px}
.page-subtitle{font:16px/1.6 var(--font-b);color:rgba(17,17,16,.55);max-width:560px;margin:0 0 56px}

/* editorial page */
.editorial-page{padding:140px 48px 140px;max-width:1300px;margin:0 auto}
.editorial-page h1{font-family:var(--font-d);font-weight:300;font-size:clamp(32px,4vw,48px);margin:0 0 40px}
.tab-row{display:flex;gap:10px;margin-bottom:56px}
.tab{font:11px/1 var(--font-b);letter-spacing:.05em;text-transform:uppercase;border:1px solid var(--line);padding:9px 18px;cursor:pointer}
.tab.active{border-color:var(--ink);background:var(--ink);color:var(--paper)}
.featured-article{display:grid;grid-template-columns:1.2fr 1fr;gap:56px;margin-bottom:100px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:100px}
#restArticles.article-grid{grid-template-columns:repeat(2,1fr)}
.article-card,.featured-article{color:inherit;text-decoration:none}
.article-card{display:block}
.article-card:hover .ph-img,.featured-article:hover .ph-img{transform:scale(1.05)}

/* article detail page */
.article-page{padding:140px 48px 160px;max-width:1300px;margin:0 auto}
.article-container{max-width:760px;margin:0 auto}
.article-hero{margin-bottom:40px}
.article-header{margin-bottom:40px}
.article-heading{font-family:var(--font-d);font-weight:300;font-size:clamp(28px,3.6vw,44px);line-height:1.15;margin:10px 0 16px}
.article-byline{font:13px/1 var(--font-b);letter-spacing:.04em;text-transform:uppercase;color:rgba(17,17,16,.5)}
.article-content{font:16px/1.8 var(--font-b);color:rgba(17,17,16,.8)}
.article-content p{margin:0 0 24px}
.article-content p:last-child{margin-bottom:0}
.article-image{margin:40px 0}
.article-image figcaption{font:13px/1.5 var(--font-b);color:rgba(17,17,16,.5);text-align:center;margin-top:12px}
.article-more{margin-top:120px;padding-top:80px;border-top:1px solid var(--line)}

/* sobre page */
.sobre-page{padding:140px 48px 0;max-width:1300px;margin:0 auto}
.sobre-page h1{font-family:var(--font-d);font-weight:300;font-size:clamp(32px,4vw,48px);margin:0 0 12px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:40px;padding:64px 0;margin:64px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.stat-value{font-family:var(--font-d);font-weight:300;font-size:clamp(32px,3.4vw,48px);color:var(--ink);margin-bottom:8px}
.stat-label{font:12px/1.4 var(--font-b);letter-spacing:.05em;text-transform:uppercase;color:rgba(17,17,16,.5)}
.sobre-split{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;padding:0 0 100px}
.values-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:48px;margin:0 0 80px}
.value-card{border-top:1px solid var(--ink);padding-top:20px}
.value-title{font-family:var(--font-d);font-weight:400;font-size:20px;margin-bottom:12px}
.value-desc{font:14px/1.7 var(--font-b);color:rgba(17,17,16,.6)}
.sobre-cta{text-align:center;padding:100px 0 140px;border-top:1px solid var(--line)}
.sobre-cta .lead{max-width:640px;margin:0 auto 32px}
.sobre-cta-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}

/* contato page */
.contato-page{padding:140px 48px 140px;max-width:1300px;margin:0 auto}
.contato-page h1{font-family:var(--font-d);font-weight:300;font-size:clamp(32px,4vw,48px);margin:0 0 12px}
.contact-grid{display:grid;grid-template-columns:1fr 1.3fr;gap:80px;margin-top:56px}
.contact-item{border-top:1px solid var(--line);padding:24px 0}
.contact-label{font:11px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:rgba(17,17,16,.45);margin-bottom:8px}
.contact-value{font:16px/1.4 var(--font-b)}
.contact-value a{transition:.2s}
.contact-value a:hover{color:var(--accent)}
.contact-form{display:flex;flex-direction:column;gap:28px}
.contact-form button{align-self:flex-start}
.field-label{font:11px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;color:rgba(17,17,16,.45);display:block;margin-bottom:10px}
.field-input,.field-textarea{width:100%;border:none;border-bottom:1px solid var(--ink);padding:10px 0;font:15px/1.4 var(--font-b);font-family:var(--font-b);background:none;outline:none}
.field-textarea{resize:vertical;min-height:100px}

/* footer */
.site-footer{border-top:1px solid var(--line);padding:80px 48px 40px}
.footer-grid{max-width:1400px;margin:0 auto 64px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1.4fr;gap:48px}
.footer-tagline{font:13px/1.7 var(--font-b);color:rgba(17,17,16,.55);letter-spacing:.02em}
.footer-heading{font:12px/1 var(--font-b);letter-spacing:.08em;text-transform:uppercase;color:rgba(17,17,16,.45);margin-bottom:20px}
.footer-links{display:flex;flex-direction:column;gap:12px;font:14px/1 var(--font-b)}
.newsletter-form{display:flex;border-bottom:1px solid var(--ink);padding-bottom:12px}
.newsletter-form input{flex:1;border:none;background:none;font:14px/1 var(--font-b);outline:none}
.newsletter-form button{background:none;border:none;font:12px/1 var(--font-b);letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.footer-bottom{max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:28px;font:12px/1 var(--font-b);color:rgba(17,17,16,.45)}
.footer-social{display:flex;gap:20px}

/* responsive */
@media (max-width:1024px){
  .about-split,.profile-grid,.featured-article,.casting-card{grid-template-columns:1fr}
  .talentos-layout{grid-template-columns:1fr}
  .article-grid{grid-template-columns:repeat(2,1fr)}
  #restArticles.article-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr 1fr}
  .stats-row,.values-grid{grid-template-columns:1fr 1fr}
  .sobre-split,.contact-grid{grid-template-columns:1fr}
}
@media (max-width:640px){
  .site-header,.hero-content,.about-split,.section,.talentos-layout,.profile,.castings-page,.editorial-page,.site-footer,.sobre-page,.contato-page,.article-page{padding-left:24px;padding-right:24px}
  .article-more .article-grid{grid-template-columns:1fr}
  .talent-grid,.article-grid,.category-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
  .gallery-grid{grid-template-columns:repeat(2,1fr)}
  .footer-grid{grid-template-columns:1fr}
  .stats-row,.values-grid{grid-template-columns:1fr}
  .gallery-modal{--modal-pad:20px}
  .apply-modal-panel{padding:32px 24px}
  .field-row{grid-template-columns:1fr}
}

@media (prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .hero-content .kicker,.hero-content h1,.hero-content .btn-outline-light{animation:none;opacity:1}
  .fullscreen-menu{animation:none;clip-path:none;opacity:0;transition:opacity .01ms linear,visibility .01ms linear}
  .fullscreen-menu.open{animation:none;clip-path:none;opacity:1}
  .fullscreen-menu.closing{animation:none;clip-path:none;opacity:0}
  .cursor-dot,.cursor-ring{transition:none}
  .gallery-modal{transition:opacity .01ms linear,visibility .01ms linear}
  .gallery-modal-img,.gallery-modal.open .gallery-modal-img{transition:none;transform:none}
  .gallery-main:hover .ph-img,.gallery-thumb:hover .ph-img{transform:none}
  .apply-modal{transition:opacity .01ms linear,visibility .01ms linear}
  .apply-modal-panel,.apply-modal.open .apply-modal-panel{transition:none;transform:none}
}
```

### Fonts (`app/layout.tsx`)

```tsx
import { Montserrat, Inter } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300','400','500','600'], variable: '--font-d-raw' });
const inter = Inter({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-b-raw' });
```

Since `global.css` already declares `--font-d`/`--font-b` referencing literal family names (`'Montserrat', sans-serif`), the simplest path is to **not** rename the CSS variables — just apply `montserrat.className` / a wrapper class on `<html>` so `next/font`'s generated `@font-face` rules load, and leave `--font-d`/`--font-b` pointing at `'Montserrat'`/`'Inter'` as literal family names (next/font still registers under that family name unless you set `variable`-only mode). Simplest working approach: apply `className={`${montserrat.variable} ${inter.variable}`}` to `<html>`, then in `globals.css` set `--font-d: var(--font-d-raw), sans-serif; --font-b: var(--font-b-raw), sans-serif;` — this is the one intentional deviation from a byte-for-byte CSS copy, needed because `next/font` requires referencing its generated variable rather than a bare family name.

---

## 4. Shared chrome components

All five are **Client Components** (`"use client"`) — they're identical in markup to the Astro versions, just React instead of `<script>` tags.

### `Header.tsx`
Fixed header, hamburger button (`onClick` sets a shared "menu open" state — lift this into a small context or pass a callback from `layout.tsx`), logo `robes<span className="accent">b</span>ritto`, right-aligned `.header-region` showing "BR".

### `FullscreenMenu.tsx`
Props: `open: boolean`, `onClose: () => void`. Mirror the Astro state machine exactly:
- `open` → add `.open` class immediately.
- closing → add `.closing` class, then after **500ms** (must match `.closing` CSS animation duration) unmount/clear both classes. Use `setTimeout` cleared on unmount, not a CSS `animationend` listener, to match the current behavior exactly.
- All menu links close the menu on click (call `onClose` then let the `<Link>` navigate).

### `Footer.tsx`
4-column grid: logo+tagline, Navegação links, static (non-dynamic) Categorias labels, Newsletter form with `onSubmit={e => e.preventDefault()}` (no real submission — matches current behavior). Copyright "© 2026 Robes Britto".

### `CustomCursor.tsx`
```tsx
'use client';
// only runs when matchMedia('(hover: hover) and (pointer: fine)').matches
// dot: translate() directly to mouse position on 'mousemove'
// ring: lerp toward mouse position each animation frame, factor 0.18
// requestAnimationFrame loop; cancel on unmount
// add/remove .is-hover via mouseover/mouseout delegation on:
//   a, button, input, textarea, .talent-card, .category-tile, .category-check, .gallery-main, .gallery-thumb, .tab
// hide both elements on window 'mouseleave', restore on 'mouseenter'
```
Render `<div className="cursor-dot" />` and `<div className="cursor-ring" />` directly under `<body>` (portal not required, they're `position:fixed`).

### `ScrollReveal` — implement as a hook, not a global script
The Astro version runs one global `IntersectionObserver` over every `.reveal` in the DOM after full page load. In React, the idiomatic equivalent is a small reusable hook applied per-section, but to keep behavior identical (single observer, same options, one-shot), implement one **global** `useEffect` in `app/layout.tsx` (or a `<ScrollReveal />` client component rendered once) that:
```
if (prefersReducedMotion || no IntersectionObserver) → add .reveal-visible to all .reveal elements immediately
else → new IntersectionObserver(cb, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' })
       → observe all *current* .reveal elements, unobserve after first intersection
```
Because Next.js pages are client-navigated, re-run this scan on every route change (`usePathname()` dependency) so newly-rendered `.reveal` elements on the new page get observed. Elements just use `className="reveal"` in JSX exactly like the Astro version.

---

## 5. Content model & data layer

Port `src/content/types.ts` **exactly**:

```ts
export interface Category { name: string; description: string; image: string; }
export type Availability = 'Disponível' | 'Em turnê' | 'Indisponível';
export interface Talent {
  slug: string; name: string; category: string; city: string; age: number;
  height: string; gender: string; languages: string; availability: Availability;
  bio: string; skills: string[]; image: string; gallery: string[];
  reelThumbnail?: string; reelDuration?: string; reelUrl?: string;
}
export interface Casting {
  title: string; type: string; city: string; ageRange: string; description: string;
  requirements: string; compensation: string; deadline: string; image: string;
}
export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string };
export interface Article {
  slug: string; title: string; category: string; excerpt: string; image: string;
  date: string; author: string; readTime: string; body: ArticleBlock[];
}
export interface SiteSettings {
  email: string; phone: string; whatsapp?: string; address: string;
  instagramUrl?: string; linkedinUrl?: string;
}
export interface HomePageContent {
  heroKicker: string; heroTitleLine1: string; heroTitleLine2: string; heroImage: string;
  aboutKicker: string; aboutLead: string; aboutBody: string; aboutImage: string;
}
export interface Stat { value: string; label: string; }
export interface ValueItem { title: string; desc: string; }
export interface AboutPageContent {
  heroTitle: string; heroSubtitle: string; stats: Stat[];
  splitLead: string; splitBody: string; splitImage: string;
  values: ValueItem[]; ctaLead: string;
}
```

**Firestore collections (unchanged, reuse the existing project):**
- `categories` (auto-ID)
- `talents` (doc ID = slug)
- `castings` (auto-ID)
- `articles` (doc ID = slug)
- `singletons` (doc IDs: `siteSettings`, `homePage`, `aboutPage`)

Every doc keeps its `createdAt: serverTimestamp()` (talents/categories/castings ordered `asc`, articles ordered `desc`).

**`lib/content/repository.ts`** — server-only module (`import 'server-only'`), using `firebase-admin` to read Firestore. Replaces `content-source.ts` + `local.source.ts` + `firebase.source.ts` + the build-time env-var switch entirely — there is no more "local seed vs Firebase" fork; Next always reads Firestore live, at request time, cached the Next.js way:

```ts
export const getTalents = () => cache(async () => {
  const snap = await adminDb.collection('talents').orderBy('createdAt', 'asc').get();
  return snap.docs.map(d => d.data() as Talent);
})();
```

Wrap each read with `unstable_cache(fn, [tag], { tags: ['content'] })` (or per-entity tags: `talents`, `castings`, `articles`, `categories`, `singletons`) so the Publish action (§9) can selectively invalidate. Keep the same convenience helpers as the old repositories: `getFeaturedTalents(limit=4)`, `getFeaturedArticles(limit=3)`, `getFeaturedCastings(limit=2)`, `getTalentBySlug`, `getArticleBySlug` — same "first N" semantics as today (no dedicated "featured" flag in the schema).

---

## 6. Public pages — route-by-route

Use Server Components for all data fetching; interactive pieces are the client components from §7.

| Route | Behavior to replicate |
|---|---|
| `/` | Hero (fade-up staggered entrance, `.kicker`→`.hero-content h1`→`.btn-outline-light` at 0.1s/0.25s/0.45s), about-split, 4 featured talents, category grid, 3 featured articles, 2 featured castings. Wrap each section in `.reveal`. |
| `/talentos` | `<TalentFilterBar>` (client) + `<TalentGrid>`. Read `?category=` search param server-side to set the initial active filter passed into the client component. |
| `/talentos/[slug]` | `generateStaticParams()` over all talent slugs (still statically prerendered, just via Next SSG instead of Astro `getStaticPaths`). `<TalentGallery>` client component, reel video block, bio/ficha/skills, CTA buttons. |
| `/editorial` | Category tab row — **port as client-side filtering exactly like today** (it's inline-script filtering in Astro, not a separate island; do the same as a small client component: filters already-rendered `.article-card` elements by `data-category`, does not refetch). Featured article + grid of the rest. |
| `/editorial/[slug]` | `generateStaticParams()` over article slugs. Hero image, header, body blocks (`paragraph`/`image`), "more articles". |
| `/castings` | Full list + `<ApplyModal>` client component (fake-submits to a success state client-side, no backend — same as today). |
| `/sobre` | Hero, stats row, split section, values grid, CTA — static content from the `aboutPage` singleton. |
| `/contato` | Contact info from `siteSettings` + contact form (`preventDefault` only, no real submission — same as today). |

Use `generateStaticParams` + `revalidate` (a large number, since real invalidation happens via the Publish action's `revalidateTag`, not time) rather than pure `force-static`, so the on-demand revalidation in §9 actually has something to invalidate.

---

## 7. Interactive client components

### `TalentFilterBar.tsx` (was `src/islands/TalentFilterBar.astro`)
Props: `categories`, `activeCategory`. Renders the search input + category checkbox list (single-select toggle: clicking the active category deselects it) exactly as today, **plus the same decorative non-functional filter groups** (Cidade, Idade chips, Gênero, Altura range track, Idiomas chips, Disponibilidade) — these render but do nothing in the current site; replicate that (don't "fix" them into working filters unless asked).

Filtering logic: instead of DOM `display:none` toggling via `querySelectorAll`, use React state (`activeCategory`, `search`) and filter the talents array in JS, re-rendering `<TalentCard>` list. Keep the same matching rule: category exact-match + case-insensitive substring match on name. Update the `"{n} talentos encontrados"` results count text identically.

### `TalentGallery.tsx` (was `src/islands/TalentGallery.astro`)
Props: `images: {src, alt}[]`. State: `currentIndex`, `modalOpen`. Main image = `images[currentIndex]`; thumbnails = all *other* images in original order (skip current index) — replicate this exact "current image promoted to main, rest fill thumbnails in original order" behavior, not a simple carousel.

Modal: Escape closes, ArrowLeft/ArrowRight navigate with wraparound (`(i + images.length) % images.length`), click-outside-panel closes, `document.body.style.overflow = 'hidden'` while open. The Astro version manually reparents the modal DOM node to `document.body` to escape a `.reveal` ancestor's `transform` (which breaks `position:fixed`) — in React this isn't needed if the modal is rendered via `createPortal(modal, document.body)`, which achieves the same effect more idiomatically. Use a portal here instead of the DOM-reparenting hack.

### `ApplyModal.tsx` (casting application modal, currently inline in `castings.astro`)
Same portal approach as the gallery modal (the Astro version does the same body-reparenting trick for the same `.reveal`-ancestor reason). Form fields per `.field-row`/`.field-file` styles in §3. On submit: `preventDefault()`, show `.apply-success` state — no real backend submission, matching current behavior exactly.

### Editorial category tabs (`/editorial`)
Small client component wrapping the tab row + article grid: clicking a tab filters already-fetched articles by `data-category` client-side (same as the current inline script — it is not a separate Astro island, keep it that lightweight in React too).

---

## 8. Admin panel (native Next.js, replacing `public/admin-js`)

### Auth
Keep Firebase Auth, single-admin-email model (`c.frinkaneto@gmail.com`), but make it **server-enforced** via `middleware.ts` instead of the current client-only redirect-after-mount guard (`auth-guard.js`) — this is a real security improvement over the Astro admin (which is a static page that only checks auth client-side after the HTML has already loaded).

Approach: on login, call `signInWithEmailAndPassword` client-side, get the ID token, exchange it for a **Firebase session cookie** via a Route Handler (`POST /api/auth/session`, using `firebase-admin/auth`'s `createSessionCookie`), set as an `httpOnly` cookie. `middleware.ts` verifies that cookie on every `/admin/**` request (except `/admin/login`) via `firebase-admin/auth`'s `verifySessionCookie`, redirecting to `/admin/login` if absent/invalid/not the allowed email. Logout clears the cookie.

### Layout (`app/admin/layout.tsx`)
Port `AdminLayout.astro` + `public/admin.css` as a Client/Server Component split: `<meta name="robots" content="noindex, nofollow" />`, `.admin-nav` bar with links to every admin sub-page + logout button, `<main className="admin-main">`. Port `admin.css` into `app/admin/admin.css` (or a CSS Module) nearly verbatim — dark navbar `#17171a`/`#f7f6f3`, white cards `.admin-card` (border `#e5e3dd`, `border-radius:8px`), form fields (`border-radius:6px`, `border:1px solid #d8d5cc`), buttons (primary filled `#17171a`, `.secondary` outline, `.danger` outline `#b3261e`), `.status.ok` green `#1e7a34` / `.status.error` red — same minimal separate design system as today, not unified with the public site's look.

### CRUD pattern (same shape for talentos/castings/categorias/editorial)
Use **Server Actions** for all writes (create/update/delete) instead of the current client SDK direct-Firestore-write pattern — this lets you enforce the single-admin-email check server-side on every mutation (today it's enforced only by Firestore security rules) and call `revalidateTag` right after a write if needed. Keep list/edit page UX identical:

- **List pages**: table (thumbnail, key fields, Edit link, Delete button with a confirm step) — fetch via the repository functions from §5, delete via a Server Action.
- **Edit pages**: read `?id` search param; if present, prefill from `getDocById`; slug auto-generated from name/title on blur (port `slugify.ts` verbatim — accent-stripping ASCII slugifier) and **locked/read-only once a doc exists**, exactly like today. Image fields upload immediately on file selection (via `POST /api/upload`, which does the Storage upload server-side using `firebase-admin`, replacing the current client-SDK direct-to-Storage upload — tightens Storage rules since the client no longer needs write access at all). Show thumbnail preview + remove (`×`) button; gallery fields support multi-upload with per-index removal, same as today.

### Field lists (exact, per entity — do not add or drop fields)

- **Talentos**: `name`, `slug` (auto, locked after create), `category` (`<select>` sourced from live `categories`), `city`, `age`, `height`, `gender`, `languages`, `availability` (`<select>`: `Disponível` / `Em turnê` / `Indisponível`), `bio` (textarea), `skills` (comma-separated input → `string[]`), `image` (upload), `gallery` (multi-upload, removable), `reelThumbnail` (upload), `reelDuration`, `reelUrl`.
- **Castings**: `title`, `type`, `city`, `ageRange`, `deadline`, `description`, `requirements`, `compensation`, `image` (upload). No slug (auto-ID).
- **Editorial (articles)**: `title`, `slug` (auto, locked), `category` (free text), `date` (free text, not a date picker — matches today), `author`, `readTime`, `excerpt`, cover `image`, and a **repeatable block editor**: `+ Parágrafo` / `+ Imagem` buttons, reorderable (↑/↓), removable, image blocks have independent `alt`/`caption` fields and their own upload.
- **Categorias**: `name`, `description`, `image` (upload). No slug — Firestore auto-ID.
- **Site Settings** (singleton `siteSettings`): `email`, `phone`, `whatsapp` (optional → stored `null` if empty), `address`, `instagramUrl`, `linkedinUrl`.
- **Home Page** (singleton `homePage`): `heroKicker`, `heroTitleLine1`, `heroTitleLine2`, `heroImage` (required upload), `aboutKicker`, `aboutLead`, `aboutBody`, `aboutImage` (required upload).
- **About Page** (singleton `aboutPage`): `heroTitle`, `heroSubtitle`, `stats` repeater (`value`/`label` pairs, add/remove), `splitLead`, `splitBody`, `splitImage` (required upload), `values` repeater (`title`/`desc` pairs, add/remove), `ctaLead`.

### Firestore/Storage helper layer
Port `firestore-helpers.js` as typed server functions in `lib/content/repository.ts` (or a sibling `lib/content/admin-writes.ts`, since these run through `firebase-admin` now, not the client SDK): `listDocs`, `getDocById`, `createDoc` (writes `createdAt: serverTimestamp()`, accepts optional explicit `id` for slug-keyed docs), `updateDocById`, `deleteDocById`, `getSingletonDoc`/`setSingletonDoc` (`singletons/{id}`). Port `slugify.ts` verbatim.

---

## 9. Publish flow (replaces `publish-server` + Docker rebuild)

Dashboard (`/admin`, port of `dashboard.js`) keeps its single "Publicar" button and same status text ("Publicando..." → success/failure). On click, call a Server Action / `POST /api/publish`:

```ts
// app/api/publish/route.ts
export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Unauthorized', { status: 401 });
  const decoded = await adminAuth.verifyIdToken(token);
  if (decoded.email !== process.env.ADMIN_EMAIL) return new Response('Forbidden', { status: 403 });

  revalidateTag('content'); // or per-entity tags if you want granular publish
  return new Response('Published', { status: 200 });
}
```

This is the entire replacement for `publish-server/server.js`'s `npm run build` + `dist/` copy + Docker volume swap. Delete `publish-server/`, `docker-compose.yml`'s second service, and the `nginx.conf` `/api/` proxy — Next.js serves both the site and this route from one process.

If you want granular "draft vs published" per entity (closer to a real CMS), tag reads per collection (`talents`, `castings`, `articles`, `categories`, `singletons`) and let the Publish button revalidate all tags at once (current behavior — one global publish for everything) or expose per-section publish buttons later. Start with the single global button to match today's UX exactly.

---

## 10. Firebase config & security rules

Reuse the existing project (`robes-d2df2`) unchanged:

- **`firestore.rules`** / **`storage.rules`**: keep the current single-admin-email rule (`request.auth.token.email == 'c.frinkaneto@gmail.com'`) as a defense-in-depth backstop, but since writes now go through Server Actions using `firebase-admin` (which bypasses security rules entirely, using service-account privileges), the *client* Firebase SDK in the new admin should ideally only need `signInWithEmailAndPassword` — no direct Firestore/Storage client access at all, since uploads move server-side too (§8). This lets you tighten `storage.rules`/`firestore.rules` to deny all client reads/writes if desired, since the browser never talks to them directly anymore. Optional hardening — not required to match current behavior.
- **`.env.local`**:
  ```
  FIREBASE_PROJECT_ID=robes-d2df2
  FIREBASE_CLIENT_EMAIL=...        # from service-account.json
  FIREBASE_PRIVATE_KEY=...         # from service-account.json (escape newlines)
  FIREBASE_STORAGE_BUCKET=robes-d2df2.firebasestorage.app
  NEXT_PUBLIC_FIREBASE_API_KEY=...       # from public/admin-js/firebase-config.js
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=robes-d2df2
  ADMIN_EMAIL=c.frinkaneto@gmail.com
  ```
  Note: `public/admin-js/firebase-config.js` currently holds real client config values checked into the working tree (gitignored, but present on disk) — carry those values into `.env.local` for the new project rather than committing them again, and consider rotating the API key restriction (HTTP referrer allowlist) in the Firebase console since it was previously loaded from an unrestricted static JS file.

---

## 11. Image handling

`next/image` for all public-facing images (`TalentCard`, `ArticleCard`, `CategoryTile`, gallery, hero, etc.) instead of raw `<img>` — configure `images.remotePatterns` for `firebasestorage.googleapis.com` (Firebase Storage download URLs) and, if you keep any seed/demo content, `images.pexels.com`. This is a visual no-op (same rendered pixels) but gets automatic responsive `srcset`/lazy-loading for free; just verify `object-fit: cover` behavior via `fill` + `.ph-img` class still matches the current `position:absolute;inset:0` placeholder pattern.

Admin uploads move server-side: `POST /api/upload` (Route Handler) accepts a `FormData` file + folder name, uses `firebase-admin`'s Storage bucket to upload to `${folder}/${uuid}-${filename}` (same path convention as today: `talents/`, `castings/`, `categories/`, `articles/`, `home-page/`, `about-page/`), returns the public download URL. Client-side admin forms `fetch('/api/upload', { method: 'POST', body: formData })` instead of calling the Storage client SDK directly.

---

## 12. Deployment

- `next.config.js`: `output: 'standalone'`.
- Single-stage-build `Dockerfile`: `node:20-alpine` → `npm ci && npm run build` → copy `.next/standalone` + `.next/static` + `public/` → `CMD ["node", "server.js"]`, expose port 3000.
- `docker-compose.yml` shrinks to one service (drop `publish-server` entirely; nginx becomes optional — Next's standalone server can be exposed directly, or keep nginx purely as a TLS-terminating reverse proxy with no `/api/` special-casing needed since everything is one origin now).
- Alternative: deploy straight to Vercel, which gives you `revalidateTag`/ISR, image optimization, and Route Handlers with zero infra config — worth considering given the Docker/nginx/publish-server complexity this migration is explicitly trying to shed.

---

## 13. Suggested build order

1. Scaffold Next.js app, port `globals.css` + fonts (§3) — get raw HTML/CSS of one page (e.g. `/sobre`, the simplest) looking pixel-identical using hardcoded mock data first, before touching Firebase.
2. Build shared chrome: `Header`, `FullscreenMenu`, `Footer`, `CustomCursor`, `ScrollReveal` in `app/layout.tsx` — verify the envelope menu animation, cursor lerp, and scroll-reveal all feel identical to the live Astro site side-by-side.
3. Wire `lib/firebase/admin.ts` + `lib/content/repository.ts` against the existing Firestore project (read-only) — swap all pages from mock data to live reads.
4. Build remaining public pages + client islands (§6–7) one at a time, comparing against the running Astro site.
5. Build admin auth (`middleware.ts`, session cookie route, login page).
6. Build admin CRUD screens (§8) — talentos → castings → categorias → editorial (with block repeater) → the three singletons.
7. Build `/api/upload` and wire every admin image field to it.
8. Build `/api/publish` (§9) and wire the dashboard button; delete `publish-server/` and simplify `docker-compose.yml`.
9. Deployment (§12), then cut over DNS/hosting from the Astro/nginx setup to the new Next.js deployment.

## 14. Verification checklist against the current site

- [ ] Every route in §6/§8 renders with matching layout, spacing, and typography at 1440px, 1024px, and 375px widths (the three breakpoint tiers in `global.css`).
- [ ] Fullscreen menu open/close animation timing matches (`.7s` open, `.5s` close, same clip-path envelope shape).
- [ ] Hero fade-up stagger timing matches (0.1s / 0.25s / 0.45s delays).
- [ ] Custom cursor: dot follows instantly, ring lerps with visible lag, both grow/tint pink over interactive elements, both hidden on touch devices.
- [ ] Scroll-reveal fires once per element, 28px→0 translate, 0.8s ease, at the same scroll position (rootMargin `-60px` bottom).
- [ ] Talent filter (category + search) and editorial tabs filter without a full page reload, same match rules.
- [ ] Talent gallery: thumbnail-to-main promotion behavior, modal keyboard nav, wraparound.
- [ ] Casting apply modal and contact/newsletter forms still fake-submit (no backend) unless the owner explicitly wants those wired up now.
- [ ] `prefers-reduced-motion: reduce` disables all the animations listed in the last block of `global.css`.
- [ ] Admin: login redirects unauthenticated users; every CRUD screen's field list matches §8 exactly; slug auto-generation + lock-after-create behavior matches; image upload previews and gallery remove-by-index work; Publish button updates the public site without a full rebuild.
