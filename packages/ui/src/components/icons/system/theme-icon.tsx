import { motion } from "motion/react";
import { useId } from "react";
import Svg, { type IconProps } from "../svg";
import { springIcon } from "../../../lib/motion";

/** Matches the length of the page's theme reveal. */
const morph = { type: "spring", visualDuration: 0.7, bounce: 0 } as const;

const rays = ["M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41 1.41", "m19.07 4.93-1.41 1.41"];

/** Morphs between Lucide's sun and moon: the rays retract and a second circle bites into the disc. */
export default function ThemeIcon({ theme, ...props }: IconProps & { theme: "light" | "dark" }) {
  const id = useId();
  const dark = theme === "dark";
  const bite = dark ? { cx: 17.5, cy: 6.5 } : { cx: 30, cy: -6 };

  return (
    <Svg {...props}>
      <defs>
        <mask id={`${id}-mask`}>
          <rect width="24" height="24" fill="white" />
          <motion.circle r="6" fill="black" initial={false} animate={bite} transition={morph} />
        </mask>
        <clipPath id={`${id}-clip`}>
          <motion.circle cx="12" cy="12" initial={false} animate={{ r: dark ? 9 : 4 }} transition={morph} />
        </clipPath>
      </defs>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        variants={{ rest: { rotate: 0 }, hover: { rotate: dark ? -14 : 0 } }}
        transition={springIcon}
      >
        <motion.circle cx="12" cy="12" mask={`url(#${id}-mask)`} initial={false} animate={{ r: dark ? 9 : 4 }} transition={morph} />
        <motion.circle r="6" clipPath={`url(#${id}-clip)`} initial={false} animate={bite} transition={morph} />
      </motion.g>
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        initial={false}
        animate={dark ? { rotate: 90, scale: 0.4, opacity: 0 } : { rotate: 0, scale: 1, opacity: 1 }}
        transition={morph}
      >
        <motion.g style={{ originX: "50%", originY: "50%" }} variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }} transition={springIcon}>
          {rays.map((d) => (
            <path key={d} d={d} />
          ))}
        </motion.g>
      </motion.g>
    </Svg>
  );
}
