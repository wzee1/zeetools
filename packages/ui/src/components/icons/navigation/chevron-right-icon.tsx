import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path d="m9 18 6-6-6-6" variants={{ rest: { x: 0 }, hover: { x: 2 }, tap: { x: 3 } }} transition={springIcon} />
    </Svg>
  );
}
