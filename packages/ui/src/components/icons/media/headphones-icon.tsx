import { motion } from "motion/react";
import Slashed from "../slashed";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function HeadphonesIcon({ deafened = false, ...props }: IconProps & { deafened?: boolean }) {
  return (
    <Svg {...props}>
      <Slashed on={deafened}>
        <motion.g style={{ originX: "50%", originY: "100%" }} variants={{ rest: { scaleX: 1 }, hover: { scaleX: 1.08 }, tap: { scaleX: 0.94 } }} transition={springIcon}>
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        </motion.g>
      </Slashed>
    </Svg>
  );
}
