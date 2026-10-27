import { describe, expect, it } from "vitest";
import { createSeenFilter } from "@/lib/signaling/dedup";

describe("createSeenFilter", () => {
  it("accepts an id once and drops its repeats", () => {
    const filter = createSeenFilter();
    expect(filter.isNew("a")).toBe(true);
    expect(filter.isNew("a")).toBe(false);
    expect(filter.isNew("b")).toBe(true);
  });

  it("forgets the oldest ids past its limit", () => {
    const filter = createSeenFilter(2);
    filter.isNew("a");
    filter.isNew("b");
    filter.isNew("c");
    expect(filter.isNew("b")).toBe(false);
    expect(filter.isNew("a")).toBe(true);
  });

  it("starts over after clear", () => {
    const filter = createSeenFilter();
    filter.isNew("a");
    filter.clear();
    expect(filter.isNew("a")).toBe(true);
  });
});
