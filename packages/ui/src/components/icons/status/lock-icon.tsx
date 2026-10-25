import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

// Shackle pivots on its left leg, like a real padlock: lift, then swing open.
const shackleOpen = { y: -2, rotate: -22 };
const shackleClosed = { y: 0, rotate: 0 };

/** Unlocks on hover; `locked={false}` keeps it open, and hovering then hints at closing. */
export default function LockIcon({ locked = true, ...props }: IconProps & { locked?: boolean }) {
  return (
    <Svg {...props}>
      <motion.path
        d="M7 11V7a5 5 0 0 1 10 0v4"
        style={{ originX: "0%", originY: "100%" }}
        variants={{
          rest: locked ? shackleClosed : shackleOpen,
          hover: locked ? shackleOpen : { y: -1, rotate: -8 },
          tap: locked ? { y: -2.5, rotate: -26 } : shackleClosed,
        }}
        transition={springIcon}
      />
      <motion.rect
        width="18"
        height="11"
        x="3"
        y="11"
        rx="2"
        ry="2"
        variants={{ rest: { y: 0 }, hover: { y: [0, 0.6, 0], transition: { duration: 0.3, delay: 0.12 } }, tap: { y: 0.5 } }}
        transition={springIcon}
      />
    </Svg>
  );
}
