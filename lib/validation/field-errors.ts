import type { ZodError } from 'zod';

// Collapses a ZodError into { fieldName: firstMessage }. Issues on array
// items (e.g. `stats.0.value`) collapse onto the array's own top-level key
// (`stats`) since the admin forms show one message per repeater/block-list
// rather than reaching into individual rows.
export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_root');
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
