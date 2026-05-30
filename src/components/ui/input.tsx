import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "input-zen h-12 w-full text-[15px] tracking-normal",
        "placeholder:text-foreground/25 placeholder:font-normal",
        "disabled:cursor-not-allowed disabled:opacity-30",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
