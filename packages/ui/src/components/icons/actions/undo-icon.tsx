import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function UndoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g style={{ originX: "60%", originY: "60%" }} variants={{ rest: { rotate: 0 }, hover: { rotate: -25 }, tap: { rotate: -45 } }} transition={springIcon}>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
      </motion.g>
    </Svg>
  );
}
