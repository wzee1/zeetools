import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

export default function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        style={{ originX: "50%", originY: "0%" }}
        variants={{
          rest: { rotate: 0, transition: spring },
          hover: { rotate: [0, 14, -10, 6, -3, 0], transition: { duration: 0.7, ease: "easeInOut" } },
        }}
      >
        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        <motion.path
          d="M10.268 21a2 2 0 0 0 3.464 0"
          variants={{
            rest: { x: 0, transition: spring },
            hover: { x: [0, -1.5, 1.5, -1, 0.5, 0], transition: { duration: 0.7, delay: 0.05, ease: "easeInOut" } },
          }}
        />
      </motion.g>
    </Svg>
  );
}
