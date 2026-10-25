import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** The lens narrows like a shutter closing. */
export default function CameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
      <motion.circle
        cx="12"
        cy="13"
        r="3"
        style={{ originX: "50%", originY: "50%" }}
        variants={{ rest: { scale: 1 }, hover: { scale: 0.7 }, tap: { scale: 0.55 } }}
        transition={springIcon}
      />
    </Svg>
  );
}
