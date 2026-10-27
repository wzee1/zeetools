"use client";

import { motion } from "motion/react";

const ease = [0.32, 0.72, 0, 1] as const;

/** A green check in a hairline square that draws itself once: the square settles, then the tick strokes in. */
export default function DrawCheck() {
  return (
    <motion.span
      aria-hidden
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="flex size-9 items-center justify-center rounded-control border border-primary-text/40 bg-success-surface text-primary-text"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, ease, delay: 0.25 }}
        />
      </svg>
    </motion.span>
  );
}
