import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <motion.path d="M12 16v-4" style={{ originY: "100%" }} variants={{ rest: { scaleY: 1 }, hover: { scaleY: 1.25 } }} transition={springIcon} />
      <motion.path d="M12 8h.01" variants={{ rest: { y: 0 }, hover: { y: -1.5 } }} transition={springIcon} />
    </Svg>
  );
}
