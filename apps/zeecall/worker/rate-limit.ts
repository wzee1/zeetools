// How many WebSocket upgrades one visitor may open per window; the binding in wrangler.jsonc (JOIN_LIMITER) has to match.
export const joinLimit = 20;
const windowMs = 60_000;

/** The Workers Rate Limiting binding (declared here because the worker does not use @cloudflare/workers-types). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** Without the binding, each isolate counts for itself: enough to keep local development honest. */
const attempts = new Map<string, number[]>();

function countLocally(key: string, now = Date.now()) {
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  // Drop idle keys so the map doesn't grow for as long as the isolate runs.
  for (const [other, times] of attempts) if (times.every((at) => now - at >= windowMs)) attempts.delete(other);
  return recent.length <= joinLimit;
}

/**
 * Counts one attempt for the key (`ip:<address>`) and says whether it is still within the limit.
 * Cloudflare counts per location and approximately, which is fine for a burst limit; a failing limiter
 * lets the request through, so a limiter outage never takes calls down.
 */
export async function withinRateLimit(limiter: RateLimitBinding | undefined, key: string): Promise<boolean> {
  if (!limiter) return countLocally(key);
  try {
    return (await limiter.limit({ key })).success;
  } catch {
    // No error object and no key: they carry the visitor's address.
    console.error("Signaling: rate limiter failed");
    return true;
  }
}
