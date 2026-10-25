import { motion, type Variants } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { spring, springIcon } from "../../../lib/motion";

/** Snips twice on hover. */
export default function ScissorsIcon(props: IconProps) {
  const snip = (dir: 1 | -1): Variants => ({
    rest: { rotate: 0, transition: spring },
    hover: { rotate: [0, 12 * dir, 0, 12 * dir, 0], transition: { duration: 0.6, ease: "easeInOut" } },
    tap: { rotate: 14 * dir, transition: springIcon },
  });
  return (
    <Svg {...props}>
      <motion.g style={center} variants={snip(-1)}>
        <circle cx="6" cy="6" r="3" />
        <path d="M8.12 8.12 12 12" />
        <path d="M14.8 14.8 20 20" />
      </motion.g>
      <motion.g style={center} variants={snip(1)}>
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4 8.12 15.88" />
      </motion.g>
    </Svg>
  );
}
