import { cn } from "../../lib/utils";

/** Text that rises out of a mask when it scrolls into view. Extra bottom padding keeps descenders inside. */
export default function MaskReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span data-reveal="mask" style={{ "--d": delay } as React.CSSProperties} className={cn("block overflow-hidden pb-[0.1em] -mb-[0.1em]", className)}>
      <span className="block">{children}</span>
    </span>
  );
}
