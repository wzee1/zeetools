// Animated versions of the Lucide icons the zee layer uses. Each icon is one SVG whose parts
// move independently. They react to the "hover" and "tap" states of the nearest Motion parent
// (see `interactive` in lib/motion.ts), so they animate in step with the control around them.

import { motion, type SVGMotionProps } from "motion/react";

export type IconProps = SVGMotionProps<SVGSVGElement>;

export default function Svg({ children, ...props }: IconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      overflow="visible"
      {...props}
    >
      {children}
    </motion.svg>
  );
}
