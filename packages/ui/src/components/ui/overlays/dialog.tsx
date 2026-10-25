import { motion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import CloseIcon from "../../icons/actions/close-icon";
import { interactive } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[3px] data-[state=closed]:animate-[fade-out_260ms_var(--ease-out)_forwards] data-[state=open]:animate-[fade-in_300ms_var(--ease-out)]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-[15vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-panel border border-border glass shadow-[0_2px_6px_-2px_rgb(0_0_0/0.08),0_20px_40px_-16px_rgb(0_0_0/0.22)] data-[state=closed]:animate-[dialog-out_220ms_var(--ease-out)_forwards] data-[state=open]:animate-[dialog-in_350ms_var(--ease-out)]",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close asChild>
            <motion.button
              {...interactive}
              className="absolute top-3 right-3 cursor-pointer rounded-control p-1 text-muted transition-colors duration-200 ease-out hover:bg-surface hover:text-foreground"
            >
              <CloseIcon className="size-4" />
              <span className="sr-only">Close</span>
            </motion.button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-border px-5 py-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-base font-semibold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-1 text-muted", className)} {...props} />;
}
