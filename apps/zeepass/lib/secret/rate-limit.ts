import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

/**
 * How many requests one visitor may make per window; the bindings in wrangler.jsonc have to match.
 * Creating: a person pastes one secret at a time, so 10 a minute is far above normal use.
 * Revealing: one click per link, but a wrong key or a retry counts too, and this also slows guessing of ids.
 */
export const LIMITS = {
  create: { binding: "CREATE_LIMITER", limit: 10 },
  reveal: { binding: "REVEAL_LIMITER", limit: 30 },
} as const;

export type LimitName = keyof typeof LIMITS;

const WINDOW_MS = 60_000;

/** The Workers Rate Limiting binding (declared here because the app does not use @cloudflare/workers-types). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** Without the binding, each isolate counts for itself: enough to keep local development honest. */
const attempts = new Map<string, number[]>();

function countLocally(name: LimitName, key: string, now = Date.now()) {
  const slot = `${name}:${key}`;
  const recent = (attempts.get(slot) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  attempts.set(slot, recent);
  // Drop idle keys so the map doesn't grow for as long as the isolate runs.
  for (const [other, times] of attempts) if (times.every((at) => now - at >= WINDOW_MS)) attempts.delete(other);
  return recent.length <= LIMITS[name].limit;
}

/**
 * Counts one request for the key (`ip:<address>`) and says whether it is still within the limit.
 * Cloudflare counts per location and approximately, which is fine for a burst limit; a failing limiter
 * lets the request through, so a limiter outage never takes the tool down.
 */
export async function withinRateLimit(
  name: LimitName,
  limiter: RateLimitBinding | undefined,
  key: string
): Promise<boolean> {
  if (!limiter) return countLocally(name, key);
  try {
    return (await limiter.limit({ key })).success;
  } catch {
    // No error object and no key: they carry the visitor's address.
    console.error("Secrets: rate limiter failed");
    return true;
  }
}

/**
 * True when the current request (a Server Action call) is over the limit named. Reads the visitor's address
 * from cf-connecting-ip; outside a request or a Worker (tests, plain `next dev`) there is none, and nothing is limited.
 */
export async function isRateLimited(name: LimitName): Promise<boolean> {
  let ip: string | null;
  try {
    ip = (await headers()).get("cf-connecting-ip");
  } catch {
    return false;
  }
  if (!ip) return false;

  let limiter: RateLimitBinding | undefined;
  try {
    limiter = (getCloudflareContext().env as Record<string, RateLimitBinding | undefined>)[LIMITS[name].binding];
  } catch {
    limiter = undefined;
  }
  return !(await withinRateLimit(name, limiter, `ip:${ip}`));
}
