import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { useState } from "react";
import CheckIcon from "../../icons/status/check-icon";
import { cn } from "../../../lib/utils";

/** The check draws itself in and retracts on uncheck; the box squeezes slightly while pressed. */
export default function Checkbox({ className, checked, defaultChecked, onCheckedChange, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false);
  const value = checked ?? uncontrolled;

  return (
    <CheckboxPrimitive.Root
      checked={value}
      onCheckedChange={(next) => {
        setUncontrolled(next);
        onCheckedChange?.(next);
      }}
      className={cn(
        "peer grid size-4 shrink-0 cursor-pointer place-items-center rounded-sm border border-border-strong bg-background text-primary-foreground transition-[background-color,border-color,scale] duration-200 ease-out enabled:hover:border-foreground/40 enabled:active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckIcon checked={value === true} strokeWidth={3.5} className="size-3" />
    </CheckboxPrimitive.Root>
  );
}
