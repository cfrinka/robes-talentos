'use server';

import { requireAdmin } from '@/lib/auth';
import { createDoc, deleteDocById, updateDocById } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { talentSchema } from '@/lib/validation/schemas';
import type { Talent } from '@/lib/content/types';

// The optional reel fields are written as explicit `null` (matching the
// original admin-js/talentos-edit.js payload shape and existing Firestore
// documents) rather than omitted, which is why this differs slightly from
// the public `Talent` read type (where they're just optional strings).
export type TalentInput = Omit<Talent, 'reelThumbnail' | 'reelDuration' | 'reelUrl'> & {
  reelThumbnail: string | null;
  reelDuration: string | null;
  reelUrl: string | null;
};

export async function createTalent(data: TalentInput): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = talentSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await createDoc('talents', parsed.data, parsed.data.slug);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateTalent(id: string, data: TalentInput): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = talentSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await updateDocById('talents', id, parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteTalent(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteDocById('talents', id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
