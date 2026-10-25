import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** Lifts off on hover and launches on press. */
export default function SendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g variants={{ rest: { x: 0, y: 0, scale: 1 }, hover: { x: 1.5, y: -1.5, scale: 1 }, tap: { x: 4, y: -4, scale: 0.85 } }} transition={springIcon}>
        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
        <path d="m21.854 2.147-10.94 10.939" />
      </motion.g>
    </Svg>
  );
}
