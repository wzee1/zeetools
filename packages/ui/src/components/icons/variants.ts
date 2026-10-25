// Motion variants shared by several icons.

import type { Variants } from "motion/react";
import { draw, spring } from "../../lib/motion";

export const redraw: Variants = {
  rest: { pathLength: 1, transition: draw },
  hover: { pathLength: [0, 1], transition: draw },
};

export const center = { originX: "50%", originY: "50%" } as const;

export const sparkle = (delay: number): Variants => ({
  rest: { scale: 1, rotate: 0, transition: spring },
  hover: { scale: [1, 1.6, 1], rotate: [0, 90, 90], transition: { duration: 0.5, delay, ease: "easeOut" } },
});
