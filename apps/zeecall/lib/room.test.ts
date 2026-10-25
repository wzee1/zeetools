import { describe, expect, it } from "vitest";
import { generateRoomSlug, parseRoomFromHash, randomId, randomInt } from "@/lib/room";

describe("generateRoomSlug", () => {
  it("keeps the adjective-noun-3digits format", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateRoomSlug()).toMatch(
        /^(swift|quiet|bright|hyper|cyber|focus|clear|zen)-(stream|sync|call|peer|wave|mesh|pipe|space)-[1-9]\d{2}$/
      );
    }
  });

  it("is not constant", () => {
    const slugs = new Set(Array.from({ length: 50 }, generateRoomSlug));
    expect(slugs.size).toBeGreaterThan(10);
  });
});

describe("randomInt / randomId", () => {
  it("stays inside [0, max)", () => {
    for (let i = 0; i < 500; i++) {
      const n = randomInt(7);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
    }
  });

  it("produces lowercase base36 ids of the requested length", () => {
    expect(randomId(8)).toMatch(/^[a-z0-9]{8}$/);
    expect(randomId(4)).toMatch(/^[a-z0-9]{4}$/);
  });
});

describe("parseRoomFromHash", () => {
  it.each([
    ["", ""],
    ["#", ""],
    ["#room=quiet-mesh-123", "quiet-mesh-123"],
    ["#/room=quiet-mesh-123", "quiet-mesh-123"],
    ["#quiet-mesh-123", "quiet-mesh-123"],
    ["#room=", ""],
  ])("%j -> %j", (hash, room) => {
    expect(parseRoomFromHash(hash)).toBe(room);
  });
});
