import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Shared enter/exit animation for Radix popper content (popover, dropdown, select). */
export const popperAnimation =
  "origin-(--radix-popper-transform-origin) data-[side=bottom]:[--popover-dy:-4px] data-[side=left]:[--popover-dx:4px] data-[side=right]:[--popover-dx:-4px] data-[side=top]:[--popover-dy:4px] data-[state=open]:animate-[popover-in_280ms_var(--ease-out)] data-[state=closed]:animate-[popover-out_200ms_var(--ease-out)_forwards]";

/** Panel styling shared by floating surfaces. */
export const floatingSurface = "rounded-panel border border-border glass shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25),0_2px_6px_-2px_rgb(0_0_0/0.08)]";
