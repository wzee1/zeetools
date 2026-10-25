import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { spring, springIcon } from "../../../lib/motion";

/** Morphs between play and pause. */
export default function PlayPauseIcon({ playing = false, ...props }: IconProps & { playing?: boolean }) {
  const shown = { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" };
  const hidden = (rotate: number) => ({ opacity: 0, scale: 0.5, rotate, filter: "blur(1px)" });
  return (
    <Svg {...props}>
      <motion.g style={center} variants={{ rest: { scale: 1 }, hover: { scale: 1.08 }, tap: { scale: 0.88 } }} transition={springIcon}>
        <motion.path
          d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
          style={center}
          initial={false}
          animate={playing ? hidden(-90) : shown}
          transition={spring}
        />
        <motion.g style={center} initial={false} animate={playing ? shown : hidden(90)} transition={spring}>
          <rect x="14" y="3" width="5" height="18" rx="1" />
          <rect x="5" y="3" width="5" height="18" rx="1" />
        </motion.g>
      </motion.g>
    </Svg>
  );
}
