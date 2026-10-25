import { cn } from "@zeetools/ui/lib/utils";

export interface IconSwapProps {
  /** Shows `on` when true, `off` when false; the two cross-fade in place. */
  active: boolean;
  on: React.ReactNode;
  off: React.ReactNode;
}

/** Cross-fades between two icons that share one grid cell (opacity and a small scale, nothing else). */
export default function IconSwap({ active, on, off }: IconSwapProps) {
  const layer = "col-start-1 row-start-1 transition-[opacity,transform] duration-200 ease-out";
  return (
    <span className="grid place-items-center">
      <span aria-hidden={!active} className={cn(layer, active ? "scale-100 opacity-100" : "scale-75 opacity-0")}>
        {on}
      </span>
      <span aria-hidden={active} className={cn(layer, active ? "scale-75 opacity-0" : "scale-100 opacity-100")}>
        {off}
      </span>
    </span>
  );
}
