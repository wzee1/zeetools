import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";

/** The hands sweep a full turn. */
export default function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <motion.path
        d="M12 6v6l4 2"
        style={{ transformBox: "view-box", originX: "12px", originY: "12px" }}
        variants={{ rest: { rotate: 0 }, hover: { rotate: 360 } }}
        transition={{ type: "spring", visualDuration: 0.8, bounce: 0.1 }}
      />
    </Svg>
  );
}
