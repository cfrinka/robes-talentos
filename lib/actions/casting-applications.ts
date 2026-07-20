'use server';

import { requireAdmin } from '@/lib/auth';
import { createDoc, deleteDocById, updateDocById } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { castingApplicationSchema } from '@/lib/validation/schemas';
import type { CastingApplication, InboxStatus } from '@/lib/content/types';

// Public -- no requireAdmin. `honeypot` is a hidden form field real
// visitors never fill in; if it's non-empty we pretend to succeed without
// writing anything, so bots get no signal that they were caught.
export async function submitCastingApplication(
  data: Omit<CastingApplication, 'status'>,
  honeypot: string
): Promise<ActionResult> {
  if (honeypot) return { ok: true };

  const parsed = castingApplicationSchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));

  try {
    const application: CastingApplication = { ...parsed.data, status: 'novo' };
    await createDoc('castingApplications', application);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateCastingApplicationStatus(id: string, status: InboxStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
    await updateDocById<CastingApplication>('castingApplications', id, { status });
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteCastingApplication(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteDocById('castingApplications', id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
