import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("lets later Tailwind classes win over conflicting earlier ones", () => {
    expect(cn("px-2 text-muted", "px-4")).toBe("text-muted px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "c")).toBe("a c");
  });

  it("keeps custom theme colors distinct from sizes", () => {
    expect(cn("text-sm", "text-primary-text")).toBe("text-sm text-primary-text");
  });
});
