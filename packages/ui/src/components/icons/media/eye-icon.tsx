import { motion } from "motion/react";
import Slashed from "../slashed";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { springIcon } from "../../../lib/motion";

/** Blinks on hover; `hidden` draws a slash through it. */
export default function EyeIcon({ hidden = false, ...props }: IconProps & { hidden?: boolean }) {
  return (
    <Svg {...props}>
      <Slashed on={hidden}>
        <motion.g
          style={center}
          variants={{
            rest: { scaleY: 1, transition: springIcon },
            hover: { scaleY: [1, 0.1, 1], transition: { duration: 0.32, ease: "easeInOut" } },
          }}
        >
          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
          <circle cx="12" cy="12" r="3" />
        </motion.g>
      </Slashed>
    </Svg>
  );
}
