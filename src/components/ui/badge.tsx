import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary/8 text-primary border border-primary/10",
        secondary: "bg-secondary/8 text-secondary border border-secondary/10",
        outline: "border border-foreground/8 bg-white/50 backdrop-blur-sm text-muted-foreground",
        ghost: "bg-foreground/[0.04] text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
