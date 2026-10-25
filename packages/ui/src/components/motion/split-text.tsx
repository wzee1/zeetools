import { motion, type Variants } from "motion/react";
import { cn } from "../../lib/utils";

const ease = [0.32, 0.72, 0, 1] as const;

const char: Variants = {
  hidden: { y: "105%" },
  // will-change only for the length of the rise; Motion clears it when the animation ends.
  shown: (i: number) => ({
    y: "0%",
    transition: { duration: 1.1, ease, delay: i * 0.03 },
  }),
};

/**
 * Splits text into lines and characters that rise out of masks, one after another.
 * Screen readers get the plain text once; the split copies are hidden from them.
 * `show` drives the reveal, so a parent can hold it back (e.g. until a loading screen leaves).
 * Transform only: the masks clip, nothing reflows, and each character is its own small layer
 * only while it moves.
 */
export default function SplitText({
  lines,
  show = true,
  delay = 0,
  className,
  lineClassName,
  trailing,
  period = false,
}: {
  lines: string[];
  show?: boolean;
  delay?: number;
  className?: string;
  lineClassName?: string | ((index: number) => string);
  /** Decoration placed after the last character, inside the last line's mask. */
  trailing?: React.ReactNode;
  /** Ends the text with a full stop in the primary text color, rising with the last characters. */
  period?: boolean;
}) {
  // Running index across lines so the stagger flows from the first character to the last.
  let index = Math.round(delay / 0.03);

  return (
    <span className={cn("block", className)}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, l) => (
        <span
          key={l}
          aria-hidden
          className={cn(
            // Extra bottom padding keeps descenders and italic overhangs inside the mask.
            "block overflow-hidden pb-[0.08em] -mb-[0.08em]",
            typeof lineClassName === "function" ? lineClassName(l) : lineClassName,
          )}
        >
          {[...line].map((c, i) => (
            <motion.span key={i} custom={index++} variants={char} initial="hidden" animate={show ? "shown" : "hidden"} className="inline-block whitespace-pre">
              {c}
            </motion.span>
          ))}
          {l === lines.length - 1 && period && (
            <motion.span custom={index++} variants={char} initial="hidden" animate={show ? "shown" : "hidden"} className="inline-block text-primary-text">
              .
            </motion.span>
          )}
          {l === lines.length - 1 && trailing}
        </span>
      ))}
    </span>
  );
}
