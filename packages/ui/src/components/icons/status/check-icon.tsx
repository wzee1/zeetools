import { motion } from "motion/react";
import Svg, { type IconProps } from "../svg";
import { draw } from "../../../lib/motion";

/** Draws itself in when `checked` turns on and retracts when it turns off. */
export default function CheckIcon({ checked = true, ...props }: IconProps & { checked?: boolean }) {
  return (
    <Svg {...props}>
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={false}
        animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={checked ? draw : { duration: 0.15 }}
      />
    </Svg>
  );
}
