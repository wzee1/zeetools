import { cn } from "./utils";

const item =
  "flex h-9 items-center gap-3 rounded-control px-2.5 text-sm transition-colors duration-200 ease-out [&>svg]:size-4 [&>svg]:shrink-0";
const idle = "text-muted hover:bg-foreground/[0.04] hover:text-foreground";
const current = "bg-foreground/[0.06] text-foreground";

/** The classes of one sidebar row: an icon, then a label that truncates. `active` marks the current page. */
export function sidebarItemClass(active = false, className?: string): string {
  return cn(item, active ? current : idle, className);
}
