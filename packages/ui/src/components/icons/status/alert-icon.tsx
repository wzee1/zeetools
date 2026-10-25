import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

export default function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        variants={{
          rest: { rotate: 0, transition: spring },
          hover: { rotate: [0, -6, 5, -3, 0], transition: { duration: 0.5, ease: "easeInOut" } },
        }}
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </motion.g>
    </Svg>
  );
}
