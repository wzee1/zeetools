import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** Also responds to a "drag" state, used by the drop zone while a file is over it. */
export default function UploadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g variants={{ rest: { y: 0 }, hover: { y: -1.5 }, drag: { y: -3 }, tap: { y: -0.5 } }} transition={springIcon}>
        <path d="M12 3v12" />
        <path d="m17 8-5-5-5 5" />
      </motion.g>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </Svg>
  );
}
