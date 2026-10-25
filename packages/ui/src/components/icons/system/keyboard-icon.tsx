import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring, springIcon } from "../../../lib/motion";

const keyRows = [
  ["M6 8h.01", "M10 8h.01", "M14 8h.01", "M18 8h.01"],
  ["M8 12h.01", "M12 12h.01", "M16 12h.01"],
];

export default function KeyboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      {keyRows.flat().map((d, i) => (
        <motion.path
          key={d}
          d={d}
          variants={{
            rest: { y: 0, transition: spring },
            hover: { y: [0, 1, 0], transition: { duration: 0.32, delay: i * 0.035, ease: "easeInOut" } },
          }}
        />
      ))}
      <motion.path
        d="M7 16h10"
        style={{ originX: "50%" }}
        variants={{ rest: { scaleX: 1 }, hover: { scaleX: 0.8 }, tap: { scaleX: 0.6 } }}
        transition={springIcon}
      />
    </Svg>
  );
}
