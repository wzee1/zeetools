import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { spring, springIcon } from "../../../lib/motion";

/** Rubs back and forth on hover. */
export default function EraserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        variants={{
          rest: { x: 0, rotate: 0, transition: spring },
          hover: { x: [0, -1.5, 1.5, -1, 0], rotate: [0, -3, 3, -2, 0], transition: { duration: 0.6, ease: "easeInOut" } },
          tap: { x: 0, y: 1, transition: springIcon },
        }}
        style={center}
      >
        <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
        <path d="m5.082 11.09 8.828 8.828" />
      </motion.g>
    </Svg>
  );
}
