"use client";

import { useEffect, useState } from "react";
import { scrambleFrame } from "@/lib/scramble";

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Returns `target`, decoding it from random glyphs once on mount (and whenever it changes).
 * Starts after `delayMs`, runs `durationMs` on rAF, then settles on the exact string.
 * With reduced motion, or before mount, it is simply the target.
 */
export function useScramble(target: string, { durationMs = 700, delayMs = 250 } = {}): string {
  const [frame, setFrame] = useState(target);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + delayMs;
      const t = Math.max(0, (now - start) / durationMs);
      setFrame(t >= 1 ? target : scrambleFrame(target, ease(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setFrame(target);
    };
  }, [target, durationMs, delayMs]);

  return frame;
}
