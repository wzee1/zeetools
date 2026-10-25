"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "../../hooks/use-media-query";
import { cn } from "../../lib/utils";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * A row that drifts sideways forever and speeds up with the scroll, reversing when you scroll back up.
 *
 * The position is a MotionValue written from a requestAnimationFrame loop that only runs while
 * the row is on screen; off screen it costs nothing. The track moves by translateX alone, and
 * with reduced motion the row holds still.
 */
export default function Marquee({
  items,
  speed = 2,
  className,
  itemClassName,
}: {
  items: readonly string[];
  speed?: number;
  className?: string;
  itemClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref);
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), {
    damping: 50,
    stiffness: 400,
  });
  const boost = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], {
    clamp: false,
  });
  // Two copies: as long as one row is wider than the screen, wrapping at -50% is seamless
  // and the promoted layer stays half the size four copies would make it.
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(-1);

  useEffect(() => {
    if (reduce || !inView) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(now - last, 64);
      last = now;
      const b = boost.get();
      if (b < 0) direction.current = 1;
      else if (b > 0) direction.current = -1;
      base.set(base.get() + direction.current * speed * (delta / 1000) * (1 + Math.abs(b)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduce, inView, base, boost, speed]);

  const cells = items.map((item) => (
    <span key={item} className={cn("flex items-center", itemClassName)}>
      {item}
      <span aria-hidden className="mx-[0.4em] inline-block size-[0.18em] rounded-full bg-primary-text" />
    </span>
  ));

  // Only the first copy is read out; the second exists to close the loop.
  const row = (copy: number) => (
    <span key={copy} aria-hidden={copy > 0} className="flex shrink-0 items-center">
      {cells}
    </span>
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ x, willChange: inView && !reduce ? "transform" : "auto" }} className="flex w-max whitespace-nowrap">
        {[0, 1].map(row)}
      </motion.div>
    </div>
  );
}
