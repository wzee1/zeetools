import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { springIcon } from "../../../lib/motion";

/** `liked` fills the heart with a small pop. */
export default function HeartIcon({ liked = false, ...props }: IconProps & { liked?: boolean }) {
  return (
    <Svg {...props}>
      <motion.g style={center} variants={{ rest: { scale: 1 }, hover: { scale: 1.1 }, tap: { scale: 0.85 } }} transition={springIcon}>
        <motion.path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
          style={center}
          initial={false}
          animate={liked ? { fillOpacity: 1, scale: [1, 1.25, 1] } : { fillOpacity: 0, scale: 1 }}
          transition={{ fillOpacity: { duration: 0.2 }, scale: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
          fill="currentColor"
        />
      </motion.g>
    </Svg>
  );
}
