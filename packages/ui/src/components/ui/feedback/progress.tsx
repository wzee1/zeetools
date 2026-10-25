import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "../../../lib/utils";

/** Value changes glide; `value={null}` shows a segment sweeping across the track. */
export default function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const indeterminate = value === null || value === undefined;
  return (
    <ProgressPrimitive.Root value={value} className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-border", className)} {...props}>
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full rounded-full bg-primary",
          indeterminate ? "w-2/5 animate-[indeterminate_1.6s_cubic-bezier(0.65,0,0.35,1)_infinite]" : "w-full transition-transform duration-700 ease-out",
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
