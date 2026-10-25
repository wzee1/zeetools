import { describe, expect, it } from "vitest";
import { levelFromBins } from "@/lib/webrtc/audio-level";

describe("levelFromBins", () => {
  it("is 0 for silence and for no bins", () => {
    expect(levelFromBins(new Uint8Array(32))).toBe(0);
    expect(levelFromBins(new Uint8Array(0))).toBe(0);
  });

  it("maps the average bin to 0–1 against 128, capped at 1", () => {
    expect(levelFromBins(new Uint8Array(32).fill(64))).toBe(0.5);
    expect(levelFromBins(new Uint8Array(32).fill(255))).toBe(1);
  });

  it("quantises to 5% steps", () => {
    expect(levelFromBins(new Uint8Array(32).fill(30))).toBe(0.25);
  });
});
