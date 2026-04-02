import { ZodError } from 'zod';

/**
 * Convert a ZodError into a Record<field, message> for per-field display.
 */
export function mapZodErrors(error: ZodError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

/**
 * Convert API 400 validation errors (from ZodExceptionFilter) into the same shape.
 */
export function mapApiErrors(
  errors: { path: (string | number)[]; message: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of errors) {
    const key = e.path.join('.');
    if (!map[key]) map[key] = e.message;
  }
  return map;
}
