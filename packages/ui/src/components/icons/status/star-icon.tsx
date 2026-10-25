import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { springIcon } from "../../../lib/motion";

/** Tilts on hover; `starred` fills it with a pop. */
export default function StarIcon({ starred = false, ...props }: IconProps & { starred?: boolean }) {
  return (
    <Svg {...props}>
      <motion.g style={center} variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.1, rotate: 15 }, tap: { scale: 0.85, rotate: 15 } }} transition={springIcon}>
        <motion.path
          d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
          style={center}
          fill="currentColor"
          initial={false}
          animate={starred ? { fillOpacity: 1, scale: [1, 1.3, 1], rotate: [0, 72, 72] } : { fillOpacity: 0, scale: 1, rotate: 0 }}
          transition={{ fillOpacity: { duration: 0.2 }, default: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } }}
        />
      </motion.g>
    </Svg>
  );
}
