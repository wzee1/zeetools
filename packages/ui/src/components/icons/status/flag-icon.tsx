import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

/** Waves from the top of the pole. */
export default function FlagIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path
        d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"
        style={{ originX: "0%", originY: "100%" }}
        variants={{
          rest: { skewY: 0, rotate: 0, transition: spring },
          hover: { skewY: [0, -4, 3, -2, 0], rotate: [0, -3, 2, 0, 0], transition: { duration: 0.8, ease: "easeInOut" } },
        }}
      />
    </Svg>
  );
}
