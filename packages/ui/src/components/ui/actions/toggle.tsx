import { motion } from "motion/react";
import { Toggle as TogglePrimitive } from "radix-ui";
import { interactive, springSnappy } from "../../../lib/motion";
import { cn } from "../../../lib/utils";
import { buttonVariants } from "./button";

/**
 * Icon button with an on/off state, like Discord's mute and deafen. "On" tints it red by default;
 * pass the state on to the icon (e.g. `<MicIcon muted={pressed} />`) to animate the change.
 */
export default function Toggle({ className, children, ...props }: React.ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root asChild {...props}>
      <motion.button
        {...interactive}
        {...(props.disabled && { whileHover: undefined, whileTap: undefined })}
        variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.92 } }}
        transition={springSnappy}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          // aria-pressed rather than data-state: a wrapping Tooltip trigger overwrites data-state.
          "aria-pressed:bg-danger/10 aria-pressed:text-danger aria-pressed:hover:bg-danger/15",
          className,
        )}
      >
        {children}
      </motion.button>
    </TogglePrimitive.Root>
  );
}
