import { motion } from "motion/react";
import Slashed from "../slashed";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

export default function MicIcon({ muted = false, ...props }: IconProps & { muted?: boolean }) {
  return (
    <Svg {...props}>
      <Slashed on={muted}>
        <motion.rect x="9" y="2" width="6" height="13" rx="3" variants={{ rest: { y: 0 }, hover: { y: -1 }, tap: { y: 0.5 } }} transition={springIcon} />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v3" />
      </Slashed>
    </Svg>
  );
}
