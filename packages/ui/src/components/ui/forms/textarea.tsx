import { cn } from "../../../lib/utils";
import { fieldStyles } from "./input";

export default function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(fieldStyles, "min-h-20 resize-y py-2", className)} {...props} />;
}
