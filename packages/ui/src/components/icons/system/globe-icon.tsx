import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { spring } from "../../../lib/motion";

/** The meridian swings around as if the globe turns. */
export default function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <motion.path
        d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
        style={center}
        variants={{
          rest: { scaleX: 1, transition: spring },
          hover: { scaleX: [1, 0, -1, 0, 1], transition: { duration: 0.9, ease: "easeInOut" } },
        }}
      />
      <path d="M2 12h20" />
    </Svg>
  );
}
