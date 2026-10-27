import { describe, expect, it } from "vitest";
import { activeSecrets, addSecret, expiresAt, formatRemaining, removeSecret, type StoredSecret } from "./history";

const make = (id: string, createdAt: number, ttlSeconds = 3600): StoredSecret => ({
  id,
  shareUrl: `https://pass.wzee.dev/s/${id}#key=k`,
  burnOnRead: true,
  ttlSeconds,
  createdAt,
});

describe("secret history", () => {
  it("computes expiry from creation time and TTL", () => {
    expect(expiresAt(make("a", 1_000, 60))).toBe(61_000);
  });

  it("keeps only unexpired entries, newest first", () => {
    const list = [make("old", 0, 10), make("a", 1_000), make("b", 5_000)];
    expect(activeSecrets(list, 20_000).map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("adds to the front, replaces an existing id and prunes expired entries", () => {
    const list = [make("expired", 0, 1), make("a", 1_000)];
    const next = addSecret(list, { ...make("a", 9_000), burnOnRead: false }, 5_000);
    expect(next.map((s) => s.id)).toEqual(["a"]);
    expect(next[0].burnOnRead).toBe(false);
    expect(addSecret(next, make("b", 10_000), 5_000).map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("removes by id", () => {
    expect(removeSecret([make("a", 0), make("b", 0)], "a").map((s) => s.id)).toEqual(["b"]);
  });

  it("formats time left compactly", () => {
    expect(formatRemaining(30_000)).toBe("<1m");
    expect(formatRemaining(45 * 60_000)).toBe("45m");
    expect(formatRemaining(23 * 3_600_000 + 59 * 60_000)).toBe("23h");
    expect(formatRemaining(6 * 86_400_000 + 1)).toBe("6d");
  });
});
