import { useCallback, useSyncExternalStore } from "react";

/**
 * Live media query match. The server and the hydration pass both see `false`, so markup that
 * branches on it never mismatches; the real value arrives right after hydration.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false);
}

/** Motion's useReducedMotion reads the setting on the first client render, which breaks hydration when it differs. */
export const useReducedMotionSafe = () => useMediaQuery("(prefers-reduced-motion: reduce)");
