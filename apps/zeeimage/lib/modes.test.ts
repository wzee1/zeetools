import { describe, expect, it } from "vitest";
import { MODES, parseMode } from "./modes";

describe("parseMode", () => {
  it("reads the two extra modes", () => {
    expect(parseMode("favicon")).toBe("favicon");
    expect(parseMode("social")).toBe("social");
  });

  it("falls back to the batch pipeline for a missing or unknown value", () => {
    expect(parseMode(null)).toBe("batch");
    expect(parseMode(undefined)).toBe("batch");
    expect(parseMode("")).toBe("batch");
    expect(parseMode("batch")).toBe("batch");
    expect(parseMode("Favicon")).toBe("batch");
    expect(parseMode("nope")).toBe("batch");
  });
});

describe("MODES", () => {
  it("links every mode to a URL that parses back to it", () => {
    for (const mode of MODES) {
      const mode_ = new URL(mode.href, "https://image.wzee.dev").searchParams.get("mode");
      expect(parseMode(mode_)).toBe(mode.id);
    }
  });

  it("gives every mode its own destination", () => {
    expect(new Set(MODES.map((mode) => mode.href)).size).toBe(MODES.length);
  });
});
