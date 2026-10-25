import { cn } from "../../../lib/utils";

/** Shared by inputs, textareas and select triggers: a soft focus ring that eases in. */
export const fieldStyles =
  "w-full rounded-control border border-border-strong bg-background px-2.5 text-sm text-foreground transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted hover:border-foreground/30 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_20%,transparent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_color-mix(in_oklab,var(--danger)_20%,transparent)]";

export default function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldStyles, "h-8", className)} {...props} />;
}
