'use server';

import { requireAdmin } from '@/lib/auth';
import { createDoc, deleteDocById, updateDocById } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { categorySchema } from '@/lib/validation/schemas';
import type { Category } from '@/lib/content/types';

export async function createCategory(data: Category): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await createDoc('categories', parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateCategory(id: string, data: Category): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await updateDocById('categories', id, parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteDocById('categories', id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
