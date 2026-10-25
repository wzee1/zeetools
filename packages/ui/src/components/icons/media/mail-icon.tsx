import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** The flap opens. */
export default function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <motion.path
        d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
        style={{ originX: "50%", originY: "0%" }}
        variants={{ rest: { scaleY: 1 }, hover: { scaleY: -1 }, tap: { scaleY: -0.8 } }}
        transition={springIcon}
      />
    </Svg>
  );
}
