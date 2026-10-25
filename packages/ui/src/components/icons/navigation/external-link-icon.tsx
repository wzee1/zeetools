import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function ExternalLinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g variants={{ rest: { x: 0, y: 0 }, hover: { x: 1.5, y: -1.5 }, tap: { x: 0.5, y: -0.5 } }} transition={springIcon}>
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
      </motion.g>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  );
}
