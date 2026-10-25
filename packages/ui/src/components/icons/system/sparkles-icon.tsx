import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { springIcon } from "../../../lib/motion";

export default function SparklesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path
        d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
        style={center}
        variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 0.9, rotate: 15 }, tap: { scale: 0.8, rotate: 15 } }}
        transition={springIcon}
      />
      <motion.g style={center} variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.3, rotate: 90 } }} transition={{ ...springIcon, delay: 0.05 }}>
        <path d="M20 2v4" />
        <path d="M22 4h-4" />
      </motion.g>
      <motion.circle cx="4" cy="20" r="2" style={center} variants={{ rest: { scale: 1 }, hover: { scale: 1.4 } }} transition={{ ...springIcon, delay: 0.1 }} />
    </Svg>
  );
}
