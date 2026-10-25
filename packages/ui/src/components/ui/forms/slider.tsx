import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "../../../lib/utils";

/** The thumb grows and gains a halo while hovered or dragged. */
export default function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const count = (props.value ?? props.defaultValue ?? [0]).length;
  return (
    <SliderPrimitive.Root className={cn("relative flex h-5 w-full touch-none items-center select-none data-disabled:cursor-not-allowed data-disabled:opacity-50", className)} {...props}>
      <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-border">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label="Value"
          className="block size-4 cursor-grab rounded-full border border-black/5 bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)] transition-[scale,box-shadow] duration-300 ease-out not-data-disabled:hover:scale-110 not-data-disabled:hover:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_5px_color-mix(in_oklab,var(--primary)_15%,transparent)] focus-visible:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_5px_color-mix(in_oklab,var(--primary)_25%,transparent)] focus-visible:outline-none not-data-disabled:active:scale-125 not-data-disabled:active:cursor-grabbing data-disabled:cursor-not-allowed"
        />
      ))}
    </SliderPrimitive.Root>
  );
}
