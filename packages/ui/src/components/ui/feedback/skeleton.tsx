import { cn } from "../../../lib/utils";

/** Loading placeholder with a slow highlight sweep. */
export default function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-[shimmer_2s_linear_infinite] rounded-control bg-[linear-gradient(90deg,var(--surface)_0%,var(--border)_50%,var(--surface)_100%)] bg-size-[200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
