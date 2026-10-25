import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { springIcon } from "../../../lib/motion";

export default function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g style={center} variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: 90, scale: 1 }, tap: { rotate: 90, scale: 0.8 } }} transition={springIcon}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </motion.g>
    </Svg>
  );
}
