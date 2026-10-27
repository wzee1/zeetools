import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Server code (server actions) runs under `// @vitest-environment node`, where there is no window.
const browser = typeof window !== "undefined";

afterEach(() => {
  if (!browser) return;
  cleanup();
  localStorage.clear();
});

if (browser) {
  // Browser APIs jsdom lacks but Radix, cmdk and next-themes call.
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Motion's useInView and whileInView rely on IntersectionObserver.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;

  Element.prototype.scrollIntoView ??= () => {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  // jsdom defines scrollTo but logs "not implemented" when it is called.
  window.scrollTo = () => {};
}
