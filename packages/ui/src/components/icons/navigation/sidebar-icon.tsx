import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

/** A window with a left panel; the panel's edge nudges left on hover, toward where it goes. */
export default function SidebarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <motion.path d="M9 3v18" variants={{ rest: { x: 0 }, hover: { x: -1.5 }, tap: { x: -1 } }} transition={spring} />
    </Svg>
  );
}
