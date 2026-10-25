"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

/** Splits "2+ yrs" into 2 and "+ yrs", "4.67" into 4.67 with two decimals. */
function parse(value: string) {
  const match = value.match(/^(\d+(?:\.(\d+))?)(.*)$/);
  if (!match) return null;
  return {
    target: Number(match[1]),
    decimals: match[2]?.length ?? 0,
    suffix: match[3],
  };
}

/**
 * Counts up from zero the first time it scrolls into view. The server renders the final value,
 * so there is always something correct to read; the count writes to the text node directly
 * (no React state per frame), and an invisible copy of the final value holds the width steady.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Starts the moment the row's first pixel enters (a little before, even), so the count is
  // well under way, and finished, while the numbers are on screen.
  const inView = useInView(ref, {
    once: true,
    amount: 0,
    margin: "0px 0px 10% 0px",
  });
  const parsed = parse(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { target, decimals, suffix } = parsed;
    const format = (n: number) => `${n.toFixed(decimals)}${suffix}`;
    if (!inView) {
      el.textContent = format(0);
      return;
    }
    // Years read better landing softly; all counts share one long ease-out.
    const controls = animate(0, target, {
      duration: target > 100 ? 1.6 : 1.3,
      delay: 0.15,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => (el.textContent = format(n)),
    });
    return () => controls.stop();
    // parsed is derived from value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);

  return (
    <span className={cn("inline-grid tabular-nums", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span ref={ref} className="col-start-1 row-start-1">
        {value}
      </span>
    </span>
  );
}
