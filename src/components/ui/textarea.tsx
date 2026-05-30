import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "input-zen min-h-[120px] w-full resize-none text-[15px] leading-relaxed tracking-normal",
        "placeholder:text-foreground/25 placeholder:font-normal",
        "disabled:cursor-not-allowed disabled:opacity-30",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
