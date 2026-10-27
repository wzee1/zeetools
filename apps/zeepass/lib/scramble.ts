/** Glyphs a scrambled character is drawn from: the base64url alphabet the key itself uses. */
export const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** [0, 1) from Web Crypto: zeepass never uses Math.random, even for visuals. */
function cryptoRandom(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
}

/**
 * One frame of a left-to-right decode. Characters before the resolve front show their final value,
 * the rest show a random glyph. Separators (/ : . # = ?) never scramble, so the URL keeps its shape.
 * `progress` runs from 0 (all scrambled) to 1 (fully resolved); `random` returns [0, 1).
 */
export function scrambleFrame(target: string, progress: number, random: () => number = cryptoRandom): string {
  const p = Math.min(1, Math.max(0, progress));
  const front = Math.floor(p * target.length);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (i < front || /[/:.#=?]/.test(ch)) {
      out += ch;
    } else {
      out += SCRAMBLE_GLYPHS[Math.floor(random() * SCRAMBLE_GLYPHS.length)];
    }
  }
  return out;
}
