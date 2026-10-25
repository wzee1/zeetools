import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: 90, scale: 1 }, tap: { rotate: 90, scale: 0.85 } }}
        transition={springIcon}
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </motion.g>
    </Svg>
  );
}
