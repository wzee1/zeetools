import { motion } from "motion/react";
import { Popover as PopoverPrimitive } from "radix-ui";
import CloseIcon from "../../icons/actions/close-icon";
import { interactive } from "../../../lib/motion";
import { cn, floatingSurface, popperAnimation } from "../../../lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export function PopoverContent({
  className,
  children,
  align = "center",
  sideOffset = 6,
  showClose = true,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { showClose?: boolean }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(floatingSurface, popperAnimation, "relative z-50 w-72 p-4 outline-none", className)}
        {...props}
      >
        {children}
        {showClose && (
          <PopoverPrimitive.Close asChild>
            <motion.button
              {...interactive}
              aria-label="Close"
              className="absolute top-2.5 right-2.5 cursor-pointer rounded-control p-1 text-muted transition-colors duration-200 ease-out hover:bg-surface hover:text-foreground"
            >
              <CloseIcon className="size-4" />
            </motion.button>
          </PopoverPrimitive.Close>
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
