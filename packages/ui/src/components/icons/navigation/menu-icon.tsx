import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

/** Three lines; on hover the middle one draws in a little shorter, like a list settling. */
export default function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6h16" />
      <motion.path d="M4 12h16" variants={{ rest: { pathLength: 1 }, hover: { pathLength: 0.7 } }} transition={spring} />
      <path d="M4 18h16" />
    </Svg>
  );
}
