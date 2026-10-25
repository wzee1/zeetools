'use client';

import { motion } from 'motion/react';
import { useId } from 'react';
import { spring } from '../../../lib/motion';
import { cn } from '../../../lib/utils';

export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  /** Optional second line under the label. */
  sub?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (id: T) => void;
  options: SegmentedOption<T>[];
  'aria-label'?: string;
  className?: string;
}

/** A radio group drawn as one control; the selected segment's surface glides to the new choice. */
export default function Segmented<T extends string>({ value, onChange, options, className, ...props }: SegmentedProps<T>) {
  const layoutId = useId();
  return (
    <div role="radiogroup" aria-label={props['aria-label']} className={cn('flex gap-0.5 rounded-control bg-surface p-0.5 ring-1 ring-border ring-inset', className)}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative flex min-h-9 flex-1 cursor-pointer flex-col items-center justify-center rounded-[5px] px-2 py-1.5 text-center text-xs font-medium whitespace-nowrap transition-colors duration-200 ease-out active:scale-[0.98] sm:text-sm',
              active ? 'text-foreground' : 'text-muted hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={spring}
                className="absolute inset-0 rounded-[5px] bg-surface-raised shadow-[0_1px_2px_rgb(0_0_0/0.12)] ring-1 ring-border ring-inset"
              />
            )}
            <span className="relative">{opt.label}</span>
            {opt.sub && <span className="relative text-[11px] font-normal text-muted max-sm:sr-only">{opt.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
