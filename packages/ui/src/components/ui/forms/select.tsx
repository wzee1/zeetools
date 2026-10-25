import { motion } from "motion/react";
import { Select as SelectPrimitive } from "radix-ui";
import ChevronDownIcon from "../../icons/navigation/chevron-down-icon";
import CheckIcon from "../../icons/status/check-icon";
import { interactive } from "../../../lib/motion";
import { cn, floatingSurface, popperAnimation } from "../../../lib/utils";
import { fieldStyles } from "./input";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger asChild {...props}>
      <motion.button
        {...interactive}
        className={cn(fieldStyles, "group flex h-8 cursor-pointer items-center justify-between gap-2 text-left data-placeholder:text-muted", className)}
      >
        <span className="truncate">{children}</span>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 shrink-0 text-muted transition-transform duration-300 ease-out group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </motion.button>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={6}
        className={cn(
          floatingSurface,
          popperAnimation,
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden p-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("px-2 pt-1.5 pb-1 text-xs font-medium text-muted", className)} {...props} />;
}

export function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "group relative flex h-8 cursor-pointer items-center rounded-[5px] pr-8 pl-2 text-sm outline-none transition-colors duration-150 ease-out select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-surface",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex size-4 items-center justify-center text-primary-text">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}
