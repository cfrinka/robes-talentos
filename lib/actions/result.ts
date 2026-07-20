// Shared return shape for every mutating Server Action, so admin forms can
// show an inline status message exactly like the old vanilla-JS admin did,
// instead of relying on Next.js's thrown-error/error-boundary handling.
export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function actionError(err: unknown): ActionResult {
  return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido.' };
}

// Server-side mirror of the client-side zod check: forms validate before
// calling the action, but the action re-validates so a request that skips
// the browser (or a stale client) can't write bad data.
export function actionValidationError(fieldErrors: Record<string, string>): ActionResult {
  return { ok: false, error: Object.values(fieldErrors)[0] ?? 'Dados inválidos.', fieldErrors };
}
