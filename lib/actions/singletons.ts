'use server';

import { requireAdmin } from '@/lib/auth';
import { setSingletonDoc } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { aboutPageSchema, homePageSchema, siteSettingsSchema } from '@/lib/validation/schemas';
import type { AboutPageContent, HomePageContent, SiteSettings } from '@/lib/content/types';

// whatsapp/instagramUrl/linkedinUrl are written as explicit `null` (matching
// admin-js/site-settings.js and existing Firestore documents), not omitted.
export type SiteSettingsInput = Omit<SiteSettings, 'whatsapp' | 'instagramUrl' | 'linkedinUrl'> & {
  whatsapp: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
};

export async function saveSiteSettings(data: SiteSettingsInput): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = siteSettingsSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await setSingletonDoc('siteSettings', parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function saveHomePage(data: HomePageContent): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = homePageSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await setSingletonDoc('homePage', parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function saveAboutPage(data: AboutPageContent): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = aboutPageSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await setSingletonDoc('aboutPage', parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
