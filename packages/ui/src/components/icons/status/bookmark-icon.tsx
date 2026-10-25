import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** Lifts on hover; `saved` fills it and drops it into place. */
export default function BookmarkIcon({ saved = false, ...props }: IconProps & { saved?: boolean }) {
  return (
    <Svg {...props}>
      {/* Hover lives on the group: an element with its own `animate` stops inheriting hover state. */}
      <motion.g style={{ originX: "50%", originY: "0%" }} variants={{ rest: { y: 0, scaleY: 1 }, hover: { y: -1, scaleY: 1.06 }, tap: { y: 0, scaleY: 0.92 } }} transition={springIcon}>
        <motion.path
          d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"
          fill="currentColor"
          initial={false}
          animate={{ fillOpacity: saved ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.g>
    </Svg>
  );
}
