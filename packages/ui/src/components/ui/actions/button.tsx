import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";
import { Slot } from "radix-ui";
import { interactive, springSnappy } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-[background-color,border-color,color,opacity] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] enabled:hover:bg-primary-hover",
        secondary: "border border-border-strong bg-surface-raised text-foreground enabled:hover:border-foreground/25 enabled:hover:bg-surface",
        ghost: "text-muted enabled:hover:bg-surface enabled:hover:text-foreground",
        danger: "bg-danger-solid text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] enabled:hover:bg-danger-solid-hover",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-sm",
        icon: "size-8",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

const MotionSlot = motion.create(Slot.Root);

type ButtonProps = HTMLMotionProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

/** Presses with a spring and passes hover/tap state to animated icons inside (components/icons). */
export default function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? MotionSlot : motion.button;
  return (
    <Comp
      {...interactive}
      // Disabled buttons still receive pointer events (for the cursor), so switch off hover/press motion.
      {...(props.disabled && { whileHover: undefined, whileTap: undefined })}
      variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.98 } }}
      transition={springSnappy}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
