import type { Transition } from "motion/react";

// Critically damped (bounce 0) springs: they never wobble, and they pick up from the
// current position and velocity when interrupted, so hover-out never snaps.

/** Default for anything that moves. */
export const spring: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

/** Presses, highlights and small state changes. */
export const springSnappy: Transition = { type: "spring", visualDuration: 0.18, bounce: 0 };

/** Icon parts: a touch of life without visible overshoot. */
export const springIcon: Transition = { type: "spring", visualDuration: 0.35, bounce: 0.15 };

/** Strokes that redraw themselves. */
export const draw: Transition = { duration: 0.45, ease: [0.32, 0.72, 0, 1] };

/**
 * Interactive elements set these states; animated icons inside them inherit the state
 * through Motion's variant propagation and move their own parts.
 */
export const interactive = { initial: "rest", animate: "rest", whileHover: "hover", whileTap: "tap" } as const;
