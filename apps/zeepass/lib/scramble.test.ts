import { describe, expect, it } from "vitest";
import { SCRAMBLE_GLYPHS, scrambleFrame } from "./scramble";

const url = "https://pass.wzee.dev/s/abc#key=XyZ_09";

describe("scrambleFrame", () => {
  it("is fully resolved at progress 1, and clamps beyond it", () => {
    expect(scrambleFrame(url, 1)).toBe(url);
    expect(scrambleFrame(url, 3)).toBe(url);
  });

  it("keeps length and separators while scrambling the rest", () => {
    const frame = scrambleFrame(url, 0, () => 0);
    expect(frame).toHaveLength(url.length);
    for (let i = 0; i < url.length; i++) {
      if (/[/:.#=?]/.test(url[i])) expect(frame[i]).toBe(url[i]);
      else expect(frame[i]).toBe(SCRAMBLE_GLYPHS[0]);
    }
  });

  it("resolves characters left to right as progress grows", () => {
    const half = scrambleFrame(url, 0.5, () => 0.999);
    const front = Math.floor(url.length / 2);
    expect(half.slice(0, front)).toBe(url.slice(0, front));
    expect(half.slice(front)).not.toBe(url.slice(front));
  });
});
