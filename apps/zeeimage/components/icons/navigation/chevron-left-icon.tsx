import { motion } from "motion/react";
import Svg, { type IconProps } from "@zeetools/ui/components/icons/svg";
import { springIcon } from "@zeetools/ui/lib/motion";

export default function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <motion.path d="m15 18-6-6 6-6" variants={{ rest: { x: 0 }, hover: { x: -2 }, tap: { x: -3 } }} transition={springIcon} />
    </Svg>
  );
}
