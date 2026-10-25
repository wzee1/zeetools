import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        style={{ originX: "100%", originY: "100%" }}
        variants={{ rest: { rotate: 0, y: 0 }, hover: { rotate: 12, y: -1 }, tap: { rotate: 4, y: 0 } }}
        transition={springIcon}
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </motion.g>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Svg>
  );
}
