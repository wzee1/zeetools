"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "../../lib/utils";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

/** Mounts its StaggerItem children one after another: each fades in and rises 8px. */
export default function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={cn("w-full", className)}>
      {children}
    </motion.div>
  );
}
