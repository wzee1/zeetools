'use client';

import { motion } from 'motion/react';

const ease = [0.32, 0.72, 0, 1] as const;

/** Re-keys on `value`, so a changed number fades in and settles 4px from below. Use with tabular-nums. */
export default function Tick({ value, className }: { value: React.ReactNode; className?: string }) {
  return (
    <motion.span
      key={String(value)}
      className={className}
      style={{ display: 'inline-block' }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease }}
    >
      {value}
    </motion.span>
  );
}
