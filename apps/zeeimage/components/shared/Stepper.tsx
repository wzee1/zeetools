'use client';

import { motion } from 'motion/react';
import CheckIcon from '@zeetools/ui/components/icons/status/check-icon';
import { cn } from '@zeetools/ui/lib/utils';
import { spring } from '@zeetools/ui/lib/motion';

export interface StepDef {
  id: number;
  label: string;
  desc: string;
}

interface StepperProps {
  steps: StepDef[];
  activeStep: number;
  isAccessible: (id: number) => boolean;
  onSelect: (id: number) => void;
}

/**
 * Step indicator: numbered squares joined by hairlines. The active step is neutral (ink), done steps and the
 * progress line are green, the rest are muted. On phones only the active label shows (the others stay in
 * the DOM for assistive tech), so the row never scrolls; the descriptions show once the card is wide enough.
 */
export default function Stepper({ steps, activeStep, isAccessible, onSelect }: StepperProps) {
  return (
    <nav aria-label="Processing Progress" className="@container">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          const accessible = isAccessible(step.id);

          return (
            <li key={step.id} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <button
                onClick={() => accessible && onSelect(step.id)}
                disabled={!accessible}
                aria-current={isActive ? 'step' : undefined}
                className="group flex cursor-pointer items-center gap-3 rounded-control text-left transition-opacity duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-control text-xs font-medium tabular-nums transition-colors duration-200 ease-out',
                    isActive
                      ? 'bg-foreground text-background'
                      : isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border-strong text-muted group-enabled:group-hover:text-foreground'
                  )}
                >
                  {isCompleted ? <CheckIcon className="size-3.5" /> : step.id}
                </span>
                <span className={cn('flex-col', isActive ? 'flex' : 'sr-only @min-[40rem]:not-sr-only @min-[40rem]:flex')}>
                  <span
                    className={cn(
                      'text-sm whitespace-nowrap transition-colors duration-200 ease-out',
                      isActive ? 'text-foreground' : 'text-muted group-enabled:group-hover:text-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="hidden text-xs whitespace-nowrap text-muted @min-[46rem]:block">{step.desc}</span>
                </span>
              </button>

              {i < steps.length - 1 && (
                <span aria-hidden className="relative mx-3 h-px min-w-3 flex-1 overflow-hidden bg-border sm:mx-5">
                  <motion.span
                    className="absolute inset-0 origin-left bg-primary"
                    initial={false}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={spring}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
