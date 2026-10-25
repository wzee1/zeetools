import { motion } from "motion/react";

const ease = [0.32, 0.72, 0, 1] as const;

/** Fades and lifts its children in once `show` turns true, after `delay` seconds. */
export default function Rise({ show, delay, children, className }: { show: boolean; delay: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
