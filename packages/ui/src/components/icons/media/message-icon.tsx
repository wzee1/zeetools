import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** The bubble tips toward the cursor and settles back. */
export default function MessageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
        style={{ originX: "50%", originY: "100%" }}
        variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -6, scale: 1.05 }, tap: { rotate: -3, scale: 0.94 } }}
        transition={springIcon}
      />
    </Svg>
  );
}
