import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";

export default function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        style={center}
        variants={{ rest: { rotate: 0 }, hover: { rotate: 180 }, tap: { rotate: 240 } }}
        transition={{ type: "spring", visualDuration: 0.6, bounce: 0.1 }}
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </motion.g>
    </Svg>
  );
}
