import { Tooltip as TooltipPrimitive } from "radix-ui";
import Kbd from "../display/kbd";
import type { Hotkey } from "../../../hooks/use-hotkeys";

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ label, hotkey, children }: { label: string; hotkey?: Hotkey; children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 flex origin-(--radix-tooltip-content-transform-origin) items-center gap-2 rounded-control bg-foreground/88 px-2 py-1 backdrop-blur-md text-xs text-background data-[side=bottom]:[--tooltip-dy:-3px] data-[side=left]:[--tooltip-dx:3px] data-[side=right]:[--tooltip-dx:-3px] data-[side=top]:[--tooltip-dy:3px] data-[state=closed]:animate-[fade-out_160ms_var(--ease-out)_forwards] data-[state=delayed-open]:animate-[tooltip-in_250ms_var(--ease-out)] data-[state=instant-open]:animate-[fade-in_120ms_var(--ease-out)]"
        >
          {label}
          {hotkey && <Kbd hotkey={hotkey} className="[&_kbd]:border-transparent [&_kbd]:bg-background/15 [&_kbd]:text-background [&_kbd]:shadow-none" />}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
