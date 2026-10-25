import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** The folded corner flips open. */
export default function FileIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g variants={{ rest: { y: 0 }, hover: { y: -1 }, tap: { y: 0.5 } }} transition={springIcon}>
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
        <motion.path d="M14 2v5a1 1 0 0 0 1 1h5" style={{ originX: "100%", originY: "0%" }} variants={{ rest: { scale: 1 }, hover: { scale: 0.7 } }} transition={springIcon} />
      </motion.g>
    </Svg>
  );
}
