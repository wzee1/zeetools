import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g variants={{ rest: { y: 0 }, hover: { y: 1.5 }, tap: { y: 3 } }} transition={springIcon}>
        <path d="M12 15V3" />
        <path d="m7 10 5 5 5-5" />
      </motion.g>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    </Svg>
  );
}
