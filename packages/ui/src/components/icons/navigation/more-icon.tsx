import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

export default function MoreIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {[5, 12, 19].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy="12"
          r="1"
          variants={{
            rest: { y: 0, transition: spring },
            hover: { y: [0, -2.5, 0], transition: { duration: 0.4, delay: i * 0.07, ease: "easeInOut" } },
          }}
        />
      ))}
    </Svg>
  );
}
