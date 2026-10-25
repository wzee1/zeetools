import { useEffect, useState } from "react";
import { formatHotkey, useIsMac, type Hotkey } from "../../../hooks/use-hotkeys";
import { cn, isMac } from "../../../lib/utils";

function isHeld(part: string, event: KeyboardEvent) {
  switch (part) {
    case "mod":
      return isMac() ? event.metaKey : event.ctrlKey;
    case "meta":
      return event.metaKey;
    case "ctrl":
      return event.ctrlKey;
    case "shift":
      return event.shiftKey;
    case "alt":
      return event.altKey;
    default:
      return event.type === "keydown" && event.key.toLowerCase() === part;
  }
}

/** Lights up each key while the user is holding it, so shortcut hints double as feedback. */
function useHeldKeys(parts: string[]) {
  const [held, setHeld] = useState<boolean[]>(() => parts.map(() => false));
  const signature = parts.join("+");

  useEffect(() => {
    const keys = signature.split("+");
    const update = (event: KeyboardEvent) => {
      const next = keys.map((part) => isHeld(part, event));
      setHeld((prev) => (prev.every((v, i) => v === next[i]) ? prev : next));
    };
    const reset = () => setHeld(keys.map(() => false));
    window.addEventListener("keydown", update);
    window.addEventListener("keyup", update);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", update);
      window.removeEventListener("keyup", update);
      window.removeEventListener("blur", reset);
    };
  }, [signature]);

  return held;
}

export default function Kbd({ hotkey, className }: { hotkey: Hotkey; className?: string }) {
  const keys = formatHotkey(hotkey, useIsMac());
  const held = useHeldKeys(hotkey.toLowerCase().split("+"));

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((key, i) => (
        <kbd
          key={i}
          data-held={held[i] || undefined}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-surface px-1 font-sans text-[11px] leading-none font-medium text-muted shadow-[0_1px_0_var(--border)] transition-[translate,box-shadow,background-color,border-color,color] duration-150 ease-out data-held:translate-y-px data-held:border-primary/60 data-held:bg-primary/10 data-held:text-primary-text data-held:shadow-none"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
