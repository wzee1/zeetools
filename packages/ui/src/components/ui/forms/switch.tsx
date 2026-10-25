import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "../../../lib/utils";

/**
 * iOS-style switch. While pressed, the thumb stretches toward the side it will travel to;
 * all movement is CSS transitions, so a quick press-and-release reverses smoothly.
 */
export default function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "group peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-border-strong p-0.5 transition-colors duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25),0_0_0_0.5px_rgb(0_0_0/0.04)] transition-[translate,width] duration-300 ease-out group-enabled:group-active:w-5 data-[state=checked]:translate-x-4 group-enabled:group-active:data-[state=checked]:translate-x-3" />
    </SwitchPrimitive.Root>
  );
}
