'use server';

import { requireAdmin } from '@/lib/auth';
import { createDoc, deleteDocById, updateDocById } from '@/lib/content/admin-repository';
import { actionError, actionValidationError, type ActionResult } from './result';
import { fieldErrorsFromZod } from '@/lib/validation/field-errors';
import { talentInquirySchema } from '@/lib/validation/schemas';
import type { InboxStatus, TalentInquiry } from '@/lib/content/types';

// Public -- no requireAdmin. See casting-applications.ts for the honeypot
// rationale.
export async function submitTalentInquiry(
  data: Omit<TalentInquiry, 'status'>,
  honeypot: string
): Promise<ActionResult> {
  if (honeypot) return { ok: true };

  const parsed = talentInquirySchema.safeParse(data);
  if (!parsed.success) return actionValidationError(fieldErrorsFromZod(parsed.error));

  try {
    const inquiry: TalentInquiry = { ...parsed.data, status: 'novo' };
    await createDoc('talentInquiries', inquiry);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function updateTalentInquiryStatus(id: string, status: InboxStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
    await updateDocById<TalentInquiry>('talentInquiries', id, { status });
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}

export async function deleteTalentInquiry(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteDocById('talentInquiries', id);
    return { ok: true };
  } catch (err) {
    return actionError(err);
  }
}
