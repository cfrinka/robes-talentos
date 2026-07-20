import 'server-only';
import { unstable_cache } from 'next/cache';
import { adminDb } from '../firebase/admin';
import type {
  AboutPageContent,
  Article,
  Casting,
  Category,
  HomePageContent,
  SiteSettings,
  Talent,
} from './types';

// Public, cached reads for the marketing site. Every doc in Firestore also
// carries a server-set `createdAt` timestamp purely so lists have a stable
// order -- it's not part of the public content shape below.
//
// These are wrapped in unstable_cache so Next.js caches the result across
// requests until the admin "Publicar" action calls revalidateTag for the
// matching tag (see app/api/publish/route.ts). Admin screens must NOT read
// through this module -- they use lib/content/admin-repository.ts instead,
// which always reads Firestore live, so edits are visible in the admin UI
// immediately, before publish.

// Drop `createdAt` (a Firestore Timestamp, i.e. a class instance) before
// this data crosses into Client Components -- RSC serialization only
// accepts plain objects/built-ins, and createdAt isn't part of the public
// content shape anyway (see the module comment above).
function withoutCreatedAt<T>(data: FirebaseFirestore.DocumentData): T {
  const rest: Record<string, unknown> = { ...data };
  delete rest.createdAt;
  return rest as T;
}

async function fetchOrdered<T>(
  collection: string,
  direction: FirebaseFirestore.OrderByDirection = 'asc'
): Promise<T[]> {
  const snap = await adminDb.collection(collection).orderBy('createdAt', direction).get();
  return snap.docs.map((doc) => withoutCreatedAt<T>(doc.data()));
}

async function fetchSingleton<T>(id: string): Promise<T | null> {
  const doc = await adminDb.collection('singletons').doc(id).get();
  return doc.exists ? (doc.data() as T) : null;
}

const EMPTY_HOME_PAGE: HomePageContent = {
  heroKicker: '',
  heroTitleLine1: '',
  heroTitleLine2: '',
  heroImage: '',
  aboutKicker: '',
  aboutLead: '',
  aboutBody: '',
  aboutImage: '',
};

const EMPTY_ABOUT_PAGE: AboutPageContent = {
  heroTitle: '',
  heroSubtitle: '',
  stats: [],
  splitLead: '',
  splitBody: '',
  splitImage: '',
  values: [],
  ctaLead: '',
};

const EMPTY_SITE_SETTINGS: SiteSettings = {
  email: '',
  phone: '',
  address: '',
};

export const getAllCategories = unstable_cache(() => fetchOrdered<Category>('categories'), ['categories'], {
  tags: ['categories'],
});

export const getAllTalents = unstable_cache(() => fetchOrdered<Talent>('talents'), ['talents'], {
  tags: ['talents'],
});

export const getAllCastings = unstable_cache(() => fetchOrdered<Casting>('castings'), ['castings'], {
  tags: ['castings'],
});

export const getAllArticles = unstable_cache(() => fetchOrdered<Article>('articles', 'desc'), ['articles'], {
  tags: ['articles'],
});

export const getHomePage = unstable_cache(
  async () => (await fetchSingleton<HomePageContent>('homePage')) ?? EMPTY_HOME_PAGE,
  ['home-page'],
  { tags: ['singletons'] }
);

export const getAboutPage = unstable_cache(
  async () => (await fetchSingleton<AboutPageContent>('aboutPage')) ?? EMPTY_ABOUT_PAGE,
  ['about-page'],
  { tags: ['singletons'] }
);

export const getSiteSettings = unstable_cache(
  async () => (await fetchSingleton<SiteSettings>('siteSettings')) ?? EMPTY_SITE_SETTINGS,
  ['site-settings'],
  { tags: ['singletons'] }
);

export async function getFeaturedTalents(limit = 4): Promise<Talent[]> {
  const talents = await getAllTalents();
  return talents.slice(0, limit);
}

export async function getTalentBySlug(slug: string): Promise<Talent | undefined> {
  const talents = await getAllTalents();
  return talents.find((t) => t.slug === slug);
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.slice(0, limit);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await getAllArticles();
  return articles.find((a) => a.slug === slug);
}

export async function getFeaturedCastings(limit = 2): Promise<Casting[]> {
  const castings = await getAllCastings();
  return castings.slice(0, limit);
}

export const CONTENT_TAGS = ['talents', 'castings', 'articles', 'categories', 'singletons'] as const;
