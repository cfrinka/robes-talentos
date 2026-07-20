import { z } from 'zod';
import type { Availability } from '@/lib/content/types';

// Shared building blocks -- keep every entity schema below reading like a
// plain description of the field instead of repeating `.trim().min(1, ...)`
// everywhere. Error messages are the strings shown directly under the
// offending field, so they're written as full sentences in pt-BR.
const AVAILABILITY_VALUES: [Availability, ...Availability[]] = ['Disponível', 'Em turnê', 'Indisponível'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (message: string) => z.string().trim().min(1, message);
const optionalText = () => z.string().trim();
const image = (message = 'Envie uma imagem antes de salvar.') => z.string().trim().min(1, message);
const slug = (message: string) => text(message).regex(SLUG_PATTERN, 'Use apenas letras minúsculas, números e hifens.');
const nullableText = (message: string) => z.union([z.null(), z.string().trim().min(1, message)]);
const nullableUrl = (message = 'Informe uma URL válida.') => z.union([z.null(), z.url({ message })]);
const optionalUrl = (message = 'Informe uma URL válida.') => z.union([z.literal(''), z.url({ message })]);

export const categorySchema = z.object({
  name: text('Informe o nome da categoria.'),
  description: text('Informe uma descrição.'),
  image: image(),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const talentSchema = z.object({
  slug: slug('Informe um slug.'),
  name: text('Informe o nome.'),
  category: text('Selecione uma categoria.'),
  city: text('Informe a cidade.'),
  age: z.number().int('Informe uma idade válida.').min(0, 'A idade não pode ser negativa.').max(120, 'Informe uma idade válida.'),
  height: text('Informe a altura.'),
  gender: text('Informe o gênero.'),
  languages: text('Informe os idiomas.'),
  availability: z.enum(AVAILABILITY_VALUES, { message: 'Selecione uma disponibilidade.' }),
  bio: text('Informe uma bio.'),
  skills: z.array(z.string()),
  image: image(),
  gallery: z.array(z.string()),
  reelThumbnail: nullableText('Informe um thumbnail válido.'),
  reelDuration: nullableText('Informe a duração do reel.'),
  reelUrl: nullableUrl(),
});
export type TalentFormValues = z.infer<typeof talentSchema>;

export const castingSchema = z.object({
  title: text('Informe o título.'),
  type: text('Informe o tipo.'),
  city: text('Informe a cidade.'),
  ageRange: text('Informe a faixa etária.'),
  deadline: text('Informe o prazo de inscrição.'),
  description: text('Informe uma descrição.'),
  requirements: optionalText(),
  compensation: optionalText(),
  image: image(),
});
export type CastingFormValues = z.infer<typeof castingSchema>;

export const articleBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: text('O parágrafo não pode ficar vazio.') }),
  z.object({
    type: z.literal('image'),
    src: image('Envie uma imagem para este bloco.'),
    alt: optionalText(),
    caption: optionalText().optional(),
  }),
]);

export const articleSchema = z.object({
  title: text('Informe o título.'),
  slug: slug('Informe um slug.'),
  category: text('Informe a categoria.'),
  date: text('Informe a data.'),
  author: text('Informe o autor.'),
  readTime: optionalText(),
  excerpt: text('Informe um resumo.'),
  image: image('Envie uma imagem de capa antes de salvar.'),
  body: z.array(articleBlockSchema),
});
export type ArticleFormValues = z.infer<typeof articleSchema>;

export const siteSettingsSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  phone: text('Informe um telefone.'),
  whatsapp: nullableText('Informe um número de WhatsApp válido.'),
  address: text('Informe a localização.'),
  instagramUrl: nullableUrl(),
  linkedinUrl: nullableUrl(),
});
export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export const homePageSchema = z.object({
  heroKicker: optionalText(),
  heroTitleLine1: text('Informe o título do hero.'),
  heroTitleLine2: optionalText(),
  heroImage: image('Envie a imagem do hero antes de salvar.'),
  aboutKicker: optionalText(),
  aboutLead: optionalText(),
  aboutBody: optionalText(),
  aboutImage: image('Envie a imagem da seção antes de salvar.'),
});
export type HomePageFormValues = z.infer<typeof homePageSchema>;

export const statSchema = z.object({
  value: text('Informe um valor.'),
  label: text('Informe uma legenda.'),
});

export const valueItemSchema = z.object({
  title: text('Informe um título.'),
  desc: text('Informe uma descrição.'),
});

export const aboutPageSchema = z.object({
  heroTitle: text('Informe o título.'),
  heroSubtitle: optionalText(),
  stats: z.array(statSchema),
  splitLead: optionalText(),
  splitBody: optionalText(),
  splitImage: image('Envie uma imagem antes de salvar.'),
  values: z.array(valueItemSchema),
  ctaLead: optionalText(),
});
export type AboutPageFormValues = z.infer<typeof aboutPageSchema>;

// Public-site forms. contactSchema's ContactForm is still a client-only
// "fake submit" (no backend). castingApplicationSchema and
// talentInquirySchema back real Server Actions (see lib/actions/) that
// write to Firestore, so their shape matches the CastingApplication /
// TalentInquiry document types in lib/content/types.ts minus `status`
// (which the action sets to 'novo' on creation, never the client).
export const contactSchema = z.object({
  name: text('Informe seu nome.'),
  email: z.email('Informe um e-mail válido.'),
  subject: optionalText(),
  message: text('Escreva uma mensagem.').min(10, 'Sua mensagem deve ter pelo menos 10 caracteres.'),
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const castingApplicationSchema = z.object({
  castingTitle: text('Título do casting ausente.'),
  castingType: text('Tipo do casting ausente.'),
  castingDeadline: text('Prazo do casting ausente.'),
  name: text('Informe seu nome completo.'),
  age: z.number().int('Informe uma idade válida.').min(0, 'A idade não pode ser negativa.').max(120, 'Informe uma idade válida.'),
  email: z.email('Informe um e-mail válido.'),
  phone: text('Informe um telefone ou WhatsApp.'),
  city: text('Informe sua cidade.'),
  portfolioLink: optionalUrl(),
  photosLink: z.url('Informe um link válido para suas fotos.'),
  reelLink: optionalUrl(),
  message: optionalText(),
});
export type CastingApplicationFormValues = z.infer<typeof castingApplicationSchema>;

export const talentInquirySchema = z.object({
  talentSlug: text('Talento ausente.'),
  talentName: text('Talento ausente.'),
  name: text('Informe seu nome.'),
  email: z.email('Informe um e-mail válido.'),
  phone: optionalText(),
  message: text('Escreva uma mensagem.').min(10, 'Sua mensagem deve ter pelo menos 10 caracteres.'),
});
export type TalentInquiryFormValues = z.infer<typeof talentInquirySchema>;
