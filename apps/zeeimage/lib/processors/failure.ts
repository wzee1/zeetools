/** A short, human reason for a failed file. HEIC is refused at ingest, so a decode error here means a damaged or unreadable file. */
export function describeFailure(error: string): string {
  if (/decode|InvalidState|source image/i.test(error)) return "Couldn't read this image";
  return error;
}

/** "2 failed: Couldn't read this image" (one entry per distinct reason). */
export function failureSummary(errors: string[]): string {
  const reasons = [...new Set(errors.map(describeFailure))];
  return `${errors.length} failed: ${reasons.join(', ')}`;
}
