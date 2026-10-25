import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { draw, spring, springIcon } from "../../../lib/motion";

/** Lucide's copy icon; when `copied`, the back sheet tucks away and a check draws into the front sheet. */
export default function CopyIcon({ copied = false, ...props }: IconProps & { copied?: boolean }) {
  return (
    <Svg {...props}>
      <motion.path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        initial={false}
        animate={copied ? { x: 3, y: 3, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
        transition={spring}
      />
      <motion.g variants={{ rest: { x: 0, y: 0 }, hover: { x: copied ? 0 : 1, y: copied ? 0 : 1 } }} transition={springIcon}>
        {/* With the back sheet gone, the front sheet slides to the center. */}
        <motion.g initial={false} animate={copied ? { x: -3, y: -3 } : { x: 0, y: 0 }} transition={spring}>
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <motion.path
            d="m11.5 15 2.5 2.5 4.5-4.5"
            initial={false}
            animate={copied ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={copied ? { ...draw, delay: 0.08 } : { duration: 0.15 }}
          />
        </motion.g>
      </motion.g>
    </Svg>
  );
}
