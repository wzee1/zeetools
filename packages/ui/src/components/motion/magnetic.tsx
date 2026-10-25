import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import { useReducedMotionSafe } from "../../hooks/use-media-query";
import { cn } from "../../lib/utils";

const follow = { stiffness: 180, damping: 16, mass: 0.4 };

/**
 * Pulls its child toward the pointer while hovered and springs back on leave.
 * The bounds are measured once on enter and pointer moves are batched to one per frame;
 * the pull lives in MotionValues, so hovering never re-renders. Mouse only, motion allowed only.
 */
export default function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const x = useSpring(useMotionValue(0), follow);
  const y = useSpring(useMotionValue(0), follow);
  const rect = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  const enter = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    // Measured without the current pull, so the center stays put while the element moves.
    const r = ref.current.getBoundingClientRect();
    rect.current = new DOMRect(r.x - x.get(), r.y - y.get(), r.width, r.height);
  };

  const move = (e: React.PointerEvent) => {
    if (!rect.current) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = rect.current;
      if (!r) return;
      x.set((pointer.current.x - (r.left + r.width / 2)) * strength);
      y.set((pointer.current.y - (r.top + r.height / 2)) * strength);
    });
  };

  const leave = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    rect.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerEnter={enter} onPointerMove={move} onPointerLeave={leave} style={{ x, y }} className={cn("inline-block", className)}>
      {children}
    </motion.div>
  );
}
