const ADJECTIVES = ["swift", "quiet", "bright", "hyper", "cyber", "focus", "clear", "zen"];
const NOUNS = ["stream", "sync", "call", "peer", "wave", "mesh", "pipe", "space"];

/** Uniform random integer in [0, max) from the Web Crypto CSPRNG (rejection sampling, no modulo bias). */
export function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

const BASE36 = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Random lowercase base36 string of the given length (peer ids, file ids, guest names). */
export function randomId(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += BASE36[randomInt(36)];
  return out;
}

/** Room slug in the form adjective-noun-123 (three digits, 100 to 999). */
export function generateRoomSlug(): string {
  const adj = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const noun = NOUNS[randomInt(NOUNS.length)];
  const num = 100 + randomInt(900);
  return `${adj}-${noun}-${num}`;
}

/** Extracts the room name from a location hash: "#room=x", "#/room=x" and "#x" all give "x". */
export function parseRoomFromHash(hash: string): string {
  if (!hash) return "";
  const cleaned = hash.replace(/^#\/?/, "");
  if (cleaned.startsWith("room=")) {
    return cleaned.slice(5);
  }
  return cleaned;
}
