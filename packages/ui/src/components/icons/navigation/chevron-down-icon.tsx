import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** Rotate it from the outside (e.g. `group-data-[state=open]:rotate-180`) to show open/closed. */
export default function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path d="m6 9 6 6 6-6" variants={{ rest: { y: 0 }, hover: { y: 1 }, tap: { y: 2 } }} transition={springIcon} />
    </Svg>
  );
}
