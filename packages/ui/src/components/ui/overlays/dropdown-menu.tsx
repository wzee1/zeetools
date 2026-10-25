import { DropdownMenu as DropdownPrimitive } from "radix-ui";
import ChevronRightIcon from "../../icons/navigation/chevron-right-icon";
import CheckIcon from "../../icons/status/check-icon";
import Kbd from "../display/kbd";
import type { Hotkey } from "../../../hooks/use-hotkeys";
import { cn, floatingSurface, popperAnimation } from "../../../lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;

const itemStyles =
  "group relative flex h-8 cursor-pointer items-center gap-2 rounded-[5px] px-2 text-sm outline-none transition-colors duration-150 ease-out select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-surface [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted data-highlighted:[&_svg]:text-foreground";

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={cn(floatingSurface, popperAnimation, "z-50 min-w-48 overflow-hidden p-1", className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  hotkey,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Item> & { hotkey?: Hotkey; variant?: "danger" }) {
  return (
    <DropdownPrimitive.Item
      className={cn(itemStyles, variant === "danger" && "text-danger data-highlighted:bg-danger/10 [&_svg]:text-danger data-highlighted:[&_svg]:text-danger", className)}
      {...props}
    >
      {children}
      {hotkey && <Kbd hotkey={hotkey} className="ml-auto pl-4" />}
    </DropdownPrimitive.Item>
  );
}

export function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<typeof DropdownPrimitive.CheckboxItem>) {
  return (
    <DropdownPrimitive.CheckboxItem checked={checked} className={cn(itemStyles, "pl-8", className)} {...props}>
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <CheckIcon checked={checked === true} className="text-primary-text!" />
      </span>
      {children}
    </DropdownPrimitive.CheckboxItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownPrimitive.Label>) {
  return <DropdownPrimitive.Label className={cn("px-2 pt-1.5 pb-1 text-xs font-medium text-muted", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownPrimitive.Separator>) {
  return <DropdownPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export function DropdownMenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof DropdownPrimitive.SubTrigger>) {
  return (
    <DropdownPrimitive.SubTrigger className={cn(itemStyles, "data-[state=open]:bg-surface", className)} {...props}>
      {children}
      <ChevronRightIcon className="ml-auto transition-transform duration-200 ease-out group-data-highlighted:translate-x-0.5" />
    </DropdownPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DropdownPrimitive.SubContent>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.SubContent className={cn(floatingSurface, popperAnimation, "z-50 min-w-40 overflow-hidden p-1", className)} {...props} />
    </DropdownPrimitive.Portal>
  );
}
