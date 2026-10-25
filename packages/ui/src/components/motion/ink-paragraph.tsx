"use client";

import { useInView, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

/**
 * The paragraph inks in word by word as it scrolls through the viewport.
 *
 * One MotionValue drives it all: scroll progress is written to a single CSS variable on the
 * paragraph, and every word derives its own opacity from that variable and its index in CSS.
 * No per-word subscriptions, no React renders while scrolling, and the writes stop as soon as
 * the paragraph leaves the viewport. Without JavaScript, or with reduced motion, the text is
 * simply fully inked.
 */
export default function InkParagraph({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { margin: "10% 0px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });
  const words = text.split(" ");

  // Sync the moment it comes into view, so the text never flashes fully inked before the first scroll.
  useEffect(() => {
    if (inView) ref.current?.style.setProperty("--ink", scrollYProgress.get().toFixed(3));
  }, [inView, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (inView) ref.current?.style.setProperty("--ink", p.toFixed(3));
  });

  return (
    <p ref={ref} data-ink className={cn("ink", className)} style={{ "--words": words.length } as React.CSSProperties}>
      {words.map((word, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
