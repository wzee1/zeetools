import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** The two crop corners close in on hover. */
export default function CropIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path d="M6 2v14a2 2 0 0 0 2 2h14" variants={{ rest: { x: 0, y: 0 }, hover: { x: 1.5, y: -1.5 }, tap: { x: 2.5, y: -2.5 } }} transition={springIcon} />
      <motion.path d="M18 22V8a2 2 0 0 0-2-2H2" variants={{ rest: { x: 0, y: 0 }, hover: { x: -1.5, y: 1.5 }, tap: { x: -2.5, y: 2.5 } }} transition={springIcon} />
    </Svg>
  );
}
