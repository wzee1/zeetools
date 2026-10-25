import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function LinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" variants={{ rest: { x: 0, y: 0 }, hover: { x: 1.2, y: -1.2 }, tap: { x: 0, y: 0 } }} transition={springIcon} />
      <motion.path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" variants={{ rest: { x: 0, y: 0 }, hover: { x: -1.2, y: 1.2 }, tap: { x: 0, y: 0 } }} transition={springIcon} />
    </Svg>
  );
}
