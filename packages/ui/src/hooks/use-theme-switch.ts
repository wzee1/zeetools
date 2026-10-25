import { useTheme } from "next-themes";
import { useCallback, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Freezes CSS transitions so every color swaps in one frame instead of fading element by element. */
function freezeTransitions() {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  return () => {
    // Flush styles with transitions still off, then re-enable them on the next frame.
    void getComputedStyle(document.body).opacity;
    requestAnimationFrame(() => style.remove());
  };
}

/**
 * Toggles light/dark with a circular reveal from `origin` (or the header toggle) where
 * the View Transitions API is available. Falls back to an instant switch.
 */
export function useThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes knows the theme on the client's first render but not on the server; hide it until hydrated.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      const next = resolvedTheme === "dark" ? "light" : "dark";
      const unfreeze = freezeTransitions();
      const apply = () => {
        // next-themes applies the class in an effect; set it now so the transition captures it.
        document.documentElement.classList.toggle("dark", next === "dark");
        document.documentElement.style.colorScheme = next;
        setTheme(next);
      };

      if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        apply();
        unfreeze();
        return;
      }

      const toggleRect = document.querySelector("[data-theme-toggle]")?.getBoundingClientRect();
      const x = origin?.x ?? (toggleRect ? toggleRect.left + toggleRect.width / 2 : innerWidth);
      const y = origin?.y ?? (toggleRect ? toggleRect.top + toggleRect.height / 2 : 0);
      // Past the farthest corner plus the 160px feather, so the edge fully clears the screen.
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 160;

      const transition = document.startViewTransition(apply);
      transition.ready.then(() => {
        document.documentElement.animate(
          { "--reveal-x": [`${x}px`, `${x}px`], "--reveal-y": [`${y}px`, `${y}px`], "--reveal-r": ["0px", `${radius}px`] },
          // Gentle start, long glide: reads as one continuous wash rather than a wipe.
          { duration: 750, easing: "cubic-bezier(0.6, 0, 0.2, 1)", fill: "both", pseudoElement: "::view-transition-new(root)" },
        );
      });
      transition.finished.finally(unfreeze);
    },
    [resolvedTheme, setTheme],
  );

  return { theme: hydrated ? resolvedTheme : undefined, toggle };
}
