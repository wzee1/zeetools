"use client";

import { motion, type Variants } from "motion/react";

const ease = [0.32, 0.72, 0, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
};

/** One step of a Stagger: fades in and rises 8px when its turn comes. */
export default function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
