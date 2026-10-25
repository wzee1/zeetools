import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        style={{ originX: "45%", originY: "45%" }}
        variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -12, scale: 1.06 }, tap: { rotate: -6, scale: 0.94 } }}
        transition={springIcon}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.34-4.34" />
      </motion.g>
    </Svg>
  );
}
