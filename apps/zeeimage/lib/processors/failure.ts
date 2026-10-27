/** A short, human reason for a failed file. Decode errors mean the browser cannot read that format. */
export function describeFailure(error: string): string {
  if (/decode|InvalidState|source image/i.test(error)) return 'Unsupported in this browser';
  return error;
}

/** "2 failed: Unsupported in this browser" (one entry per distinct reason). */
export function failureSummary(errors: string[]): string {
  const reasons = [...new Set(errors.map(describeFailure))];
  return `${errors.length} failed: ${reasons.join(', ')}`;
}
