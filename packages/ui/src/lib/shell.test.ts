import { afterEach, describe, expect, it } from "vitest";
import { SIDEBAR, clampSidebarWidth, shellBootScript, shellKey } from "./shell";

const SHELL_KEY = shellKey("zeepass");

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.sidebar;
  document.documentElement.style.removeProperty("--sidebar-w");
});

describe("clampSidebarWidth", () => {
  it("keeps widths inside the limits and rounds them", () => {
    expect(clampSidebarWidth(100)).toBe(SIDEBAR.min);
    expect(clampSidebarWidth(999)).toBe(SIDEBAR.max);
    expect(clampSidebarWidth(250.6)).toBe(251);
  });

  it("falls back to the default for nonsense", () => {
    expect(clampSidebarWidth(Number.NaN)).toBe(SIDEBAR.default);
  });
});

describe("shellKey", () => {
  it("keeps the key apps already persist under", () => {
    expect(shellKey("zeepass")).toBe("zeepass:shell");
  });
});

describe("shellBootScript", () => {
  const run = () => new Function(shellBootScript(SHELL_KEY))();

  it("applies a saved collapsed state and a clamped width before paint", () => {
    localStorage.setItem(SHELL_KEY, JSON.stringify({ collapsed: true, width: 9000 }));
    run();
    expect(document.documentElement.dataset.sidebar).toBe("collapsed");
    expect(document.documentElement.style.getPropertyValue("--sidebar-w")).toBe(`${SIDEBAR.max}px`);
  });

  it("does nothing without saved state, and survives corrupt JSON", () => {
    run();
    expect(document.documentElement.dataset.sidebar).toBeUndefined();
    localStorage.setItem(SHELL_KEY, "{oops");
    expect(run).not.toThrow();
  });
});
