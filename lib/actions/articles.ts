'use server';

import { requireAdmin } from '@/lib/auth';
import { createDoc, deleteDocById, updateDocById } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { articleSchema } from '@/lib/validation/schemas';
import type { Article } from '@/lib/content/types';

export async function createArticle(data: Article): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = articleSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await createDoc('articles', parsed.data, parsed.data.slug);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateArticle(id: string, data: Article): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (err) {
    return actionError(err);
  }
  const parsed = articleSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));
  try {
    await updateDocById('articles', id, parsed.data);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteDocById('articles', id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
