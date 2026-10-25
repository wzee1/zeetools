import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** The sun rises over the hill. */
export default function ImageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <motion.circle cx="9" cy="9" r="2" variants={{ rest: { y: 0, x: 0 }, hover: { y: -1.5, x: 1 }, tap: { y: 0, x: 0 } }} transition={springIcon} />
      <motion.path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" variants={{ rest: { y: 0 }, hover: { y: 1 } }} transition={springIcon} />
    </Svg>
  );
}
