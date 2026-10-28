import { cn } from "@zeetools/ui/lib/utils";

interface ChoiceButtonProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  /** A second line: a description, a badge or a size. */
  sub?: string;
  /** Set the second line in mono (sizes, ratios). */
  mono?: boolean;
  className?: string;
  disabled?: boolean;
}

/** A selectable control: a hairline outline that turns green when selected, no tint. */
export default function ChoiceButton({ selected, onClick, title, sub, mono = false, className, disabled = false }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-control border bg-surface-raised p-3 text-left transition-[border-color,background-color,scale] duration-200 ease-out active:scale-[0.98]",
        selected ? "border-primary" : "border-border hover:border-border-strong hover:bg-surface",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-surface-raised disabled:active:scale-100",
        className,
      )}
    >
      <span className="text-sm font-medium text-foreground">{title}</span>
      {sub && <span className={cn("text-xs leading-relaxed text-muted", mono && "font-mono tabular-nums")}>{sub}</span>}
    </button>
  );
}
