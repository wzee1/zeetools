import { motion } from "motion/react";
import { useId } from "react";
import { draw } from "../../lib/motion";

/**
 * A Lucide-style slash that draws across an icon and cuts a gap through the strokes beneath it,
 * like Discord's mute and deafen buttons. Wrap the icon's own strokes in `children`.
 */
export default function Slashed({ on, children }: { on: boolean; children: React.ReactNode }) {
  const id = useId();
  return (
    <>
      <defs>
        <mask id={`${id}-slash`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
          <rect x="-4" y="-4" width="32" height="32" fill="white" />
          <motion.path
            d="m2 2 20 20"
            stroke="black"
            strokeWidth="5.5"
            strokeLinecap="butt"
            initial={false}
            animate={{ pathLength: on ? 1 : 0 }}
            transition={draw}
          />
        </mask>
      </defs>
      <g mask={`url(#${id}-slash)`}>{children}</g>
      <motion.path d="m2 2 20 20" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={draw} />
    </>
  );
}
