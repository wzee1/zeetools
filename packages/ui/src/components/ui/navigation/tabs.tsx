import { motion } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { createContext, useContext, useId, useState } from "react";
import { spring } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

type Variant = "segmented" | "underline";
const TabsContext = createContext<{ value: string; layoutId: string; variant: Variant }>({ value: "", layoutId: "", variant: "segmented" });

/**
 * Tabs whose active marker glides between triggers. "segmented" is an iOS-style control,
 * "underline" a dashboard-style tab bar.
 */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  variant = "segmented",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & { variant?: Variant }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value ?? uncontrolled;
  const layoutId = useId();

  return (
    <TabsContext.Provider value={{ value: current, layoutId, variant }}>
      <TabsPrimitive.Root
        value={current}
        onValueChange={(next) => {
          setUncontrolled(next);
          onValueChange?.(next);
        }}
        {...props}
      />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = useContext(TabsContext);
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center",
        variant === "segmented" ? "h-8 gap-0.5 rounded-control bg-surface p-0.5 ring-1 ring-border ring-inset" : "h-9 gap-4 border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, children, value, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;

  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "relative inline-flex h-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap text-muted transition-colors duration-200 ease-out enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:text-foreground [&_svg]:size-4",
        ctx.variant === "segmented" ? "rounded-[5px] px-3" : "px-0.5",
        className,
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={ctx.layoutId}
          transition={spring}
          className={
            ctx.variant === "segmented"
              ? "absolute inset-0 rounded-[5px] bg-surface-raised shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)]"
              : "absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
          }
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-3 data-[state=active]:animate-[content-in_300ms_var(--ease-out)]", className)} {...props} />;
}
