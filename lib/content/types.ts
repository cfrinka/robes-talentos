export interface Category {
  name: string;
  description: string;
  image: string;
}

export type Availability = 'Disponível' | 'Em turnê' | 'Indisponível';

export interface Talent {
  slug: string;
  name: string;
  category: string;
  city: string;
  age: number;
  height: string;
  gender: string;
  languages: string;
  availability: Availability;
  bio: string;
  skills: string[];
  image: string;
  gallery: string[];
  reelThumbnail?: string;
  reelDuration?: string;
  reelUrl?: string;
}

export interface Casting {
  title: string;
  type: string;
  city: string;
  ageRange: string;
  description: string;
  requirements: string;
  compensation: string;
  deadline: string;
  image: string;
}

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string };

export interface Article {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
  body: ArticleBlock[];
}

export interface SiteSettings {
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export interface HomePageContent {
  heroKicker: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroImage: string;
  aboutKicker: string;
  aboutLead: string;
  aboutBody: string;
  aboutImage: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ValueItem {
  title: string;
  desc: string;
}

export interface AboutPageContent {
  heroTitle: string;
  heroSubtitle: string;
  stats: Stat[];
  splitLead: string;
  splitBody: string;
  splitImage: string;
  values: ValueItem[];
  ctaLead: string;
}

export type InboxStatus = 'novo' | 'lido' | 'arquivado';

// Casting has no public id (see lib/content/repository.ts -- fetchOrdered
// strips it), so applications snapshot the casting's display fields
// instead of referencing it by id.
export interface CastingApplication {
  castingTitle: string;
  castingType: string;
  castingDeadline: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  city: string;
  portfolioLink?: string;
  photosLink: string;
  reelLink?: string;
  message?: string;
  status: InboxStatus;
}

export interface TalentInquiry {
  talentSlug: string;
  talentName: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: InboxStatus;
}

/** A Firestore document plus its generated/natural document id. */
export type WithId<T> = T & { id: string };
