'use server';

import { requireAdmin } from '@/lib/auth';
import { createDoc, deleteDocById, updateDocById } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { castingSchema } from '@/lib/validation/schemas';
import type { Casting } from '@/lib/content/types';

export async function createCasting(data: Casting): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = castingSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await createDoc('castings', parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateCasting(id: string, data: Casting): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = castingSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await updateDocById('castings', id, parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteCasting(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteDocById('castings', id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
