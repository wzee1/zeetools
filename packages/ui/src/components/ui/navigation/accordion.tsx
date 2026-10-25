import { motion } from "motion/react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import ChevronDownIcon from "../../icons/navigation/chevron-down-icon";
import { interactive } from "../../../lib/motion";
import { cn } from "../../../lib/utils";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-border last:border-0", className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger asChild {...props}>
        <motion.button
          {...interactive}
          className={cn(
            "group flex flex-1 cursor-pointer items-center justify-between gap-4 py-3 text-left text-sm font-medium transition-colors duration-200 ease-out hover:text-foreground/80",
            className,
          )}
        >
          {children}
          <ChevronDownIcon className="size-4 shrink-0 text-muted transition-transform duration-400 ease-out group-data-[state=open]:rotate-180" />
        </motion.button>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm text-muted data-[state=closed]:animate-[accordion-up_250ms_var(--ease-out)] data-[state=open]:animate-[accordion-down_350ms_var(--ease-out)]"
      {...props}
    >
      <div className={cn("pb-3", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
