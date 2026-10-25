import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { center } from "../variants";
import { spring, springIcon } from "../../../lib/motion";

/** Charges with a flash. */
export default function ZapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path
        d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"
        style={center}
        fill="currentColor"
        variants={{
          rest: { fillOpacity: 0, scale: 1, rotate: 0, transition: spring },
          hover: { fillOpacity: [0, 0.6, 0], scale: [1, 1.15, 1], rotate: [0, -8, 0], transition: { duration: 0.45, ease: "easeOut" } },
          tap: { scale: 0.85, fillOpacity: 0.3, transition: springIcon },
        }}
      />
    </Svg>
  );
}
