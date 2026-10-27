import Kbd from "@zeetools/ui/components/ui/display/kbd";
import type { Hotkey } from "@zeetools/ui/hooks/use-hotkeys";
import { cn } from "@zeetools/ui/lib/utils";

interface ZeeKbdProps {
  hotkey: Hotkey;
  className?: string;
}

export default function ZeeKbd({ hotkey, className }: ZeeKbdProps) {
  return (
    <Kbd
      hotkey={hotkey}
      className={cn(
        "font-mono tracking-tight",
        className
      )}
    />
  );
}
