"use client";

import Button from "@zeetools/ui/components/ui/actions/button";
import { Tooltip } from "@zeetools/ui/components/ui/overlays/tooltip";
import type { Hotkey } from "@zeetools/ui/hooks/use-hotkeys";
import { cn } from "@zeetools/ui/lib/utils";

export interface DockButtonProps {
  onClick: () => void;
  /** The accessible name, with the shortcut in brackets. */
  title: string;
  /** Tooltip text; falls back to the title. */
  label?: string;
  /** Shortcut shown in the tooltip. */
  hotkey?: Hotkey;
  /** neutral (default), on (green border) or alert (danger text and border). */
  tone?: "neutral" | "on" | "alert";
  /** Panel open or feature enabled: sets aria-pressed. */
  pressed?: boolean;
  children: React.ReactNode;
}

const tones = {
  neutral: "border-transparent",
  on: "border-primary text-foreground",
  alert: "border-danger/40 text-danger enabled:hover:text-danger",
} as const;

/** One 36px (40px from sm) target in the call dock: a ghost button with a tooltip; state shows as a border, never a fill. */
export default function DockButton({ onClick, title, label, hotkey, tone = "neutral", pressed, children }: DockButtonProps) {
  return (
    <Tooltip label={label ?? title} hotkey={hotkey}>
      <Button
        variant="ghost"
        onClick={onClick}
        aria-label={title}
        aria-pressed={pressed}
        className={cn("size-9 border sm:size-10", tones[tone])}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
