import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center, sparkle } from "../variants";
import { springIcon } from "../../../lib/motion";

/** The wand flicks and its sparkles pop one after another. */
export default function WandIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g style={{ originX: "0%", originY: "100%" }} variants={{ rest: { rotate: 0 }, hover: { rotate: -8 }, tap: { rotate: 4 } }} transition={springIcon}>
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
        <path d="m14 7 3 3" />
      </motion.g>
      <motion.g style={center} variants={sparkle(0)}>
        <path d="M5 6v4" />
        <path d="M7 8H3" />
      </motion.g>
      <motion.g style={center} variants={sparkle(0.08)}>
        <path d="M10 2v2" />
        <path d="M11 3H9" />
      </motion.g>
      <motion.g style={center} variants={sparkle(0.16)}>
        <path d="M19 14v4" />
        <path d="M21 16h-4" />
      </motion.g>
    </Svg>
  );
}
