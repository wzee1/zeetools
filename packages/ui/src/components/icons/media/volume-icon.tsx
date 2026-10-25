import { motion, type Variants } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { spring } from "../../../lib/motion";

/** Sound waves ripple out on hover; `muted` retracts them. */
export default function VolumeIcon({ muted = false, ...props }: IconProps & { muted?: boolean }) {
  const wave = (delay: number): Variants => ({
    rest: { opacity: muted ? 0 : 1, scale: muted ? 0.4 : 1, x: 0, transition: spring },
    hover: muted
      ? { opacity: 0, scale: 0.4, transition: spring }
      : { x: [0, 1.5, 0], opacity: [1, 0.4, 1], transition: { duration: 0.5, delay, ease: "easeInOut" } },
  });
  return (
    <Svg {...props}>
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <motion.path d="M16 9a5 5 0 0 1 0 6" style={{ originX: "0%", originY: "50%" }} variants={wave(0)} />
      <motion.path d="M19.364 18.364a9 9 0 0 0 0-12.728" style={{ originX: "0%", originY: "50%" }} variants={wave(0.08)} />
      <motion.g initial={false} animate={{ opacity: muted ? 1 : 0, scale: muted ? 1 : 0.4 }} style={{ originX: "50%", originY: "50%" }} transition={spring}>
        <path d="m22 9-6 6" />
        <path d="m16 9 6 6" />
      </motion.g>
    </Svg>
  );
}
