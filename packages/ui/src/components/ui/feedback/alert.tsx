import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import CloseIcon from "../../icons/actions/close-icon";
import AlertIcon from "../../icons/status/alert-icon";
import InfoIcon from "../../icons/status/info-icon";
import { interactive, spring } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

const alertVariants = cva("flex gap-3 overflow-hidden rounded-panel border px-4 py-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      info: "border-border bg-surface [&>svg]:text-muted",
      warning: "border-[#d9a400]/35 bg-[#d9a400]/8 [&>svg]:text-[#b58900] dark:[&>svg]:text-[#f0c040]",
      danger: "border-danger/30 bg-danger/5 [&>svg]:text-danger",
    },
  },
  defaultVariants: { variant: "info" },
});

/**
 * The icon nudges on hover. With `dismissible`, a close button collapses the alert away;
 * `onDismiss` fires once it starts closing.
 */
export default function Alert({
  className,
  variant,
  title,
  children,
  dismissible = false,
  onDismiss,
}: { className?: string; title: string; children?: React.ReactNode; dismissible?: boolean; onDismiss?: () => void } & VariantProps<typeof alertVariants>) {
  const [open, setOpen] = useState(true);
  const Icon = variant === "info" || !variant ? InfoIcon : AlertIcon;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          {...interactive}
          whileTap={undefined}
          exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, borderWidth: 0, scale: 0.98, transition: spring }}
          role={variant === "danger" ? "alert" : "status"}
          className={cn(alertVariants({ variant }), className)}
        >
          <Icon />
          <div className="grid flex-1 gap-0.5">
            <p className="font-medium">{title}</p>
            {children && <div className="text-muted">{children}</div>}
          </div>
          {dismissible && (
            <motion.button
              {...interactive}
              onClick={() => {
                setOpen(false);
                onDismiss?.();
              }}
              aria-label="Dismiss"
              className="-mt-0.5 -mr-1.5 size-6 shrink-0 cursor-pointer rounded-control p-1 text-muted transition-colors duration-200 ease-out hover:bg-foreground/5 hover:text-foreground"
            >
              <CloseIcon className="size-4" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
