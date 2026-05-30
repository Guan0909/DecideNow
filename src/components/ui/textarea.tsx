import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "input-zen min-h-[120px] w-full resize-none text-base leading-relaxed",
      "placeholder:text-muted-foreground/40",
      "disabled:cursor-not-allowed disabled:opacity-40",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
