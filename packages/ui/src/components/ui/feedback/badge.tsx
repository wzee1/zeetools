import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const badgeVariants = cva("inline-flex h-5 items-center gap-1 rounded-full px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3", {
  variants: {
    variant: {
      neutral: "bg-surface text-muted ring-1 ring-border ring-inset",
      primary: "bg-primary/10 text-primary-text",
      success: "bg-success-surface text-success",
      danger: "bg-danger/10 text-danger",
      brand: "bg-brand text-primary-foreground",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export default function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
