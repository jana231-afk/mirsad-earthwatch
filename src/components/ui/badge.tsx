import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        open: "border-primary/25 bg-primary-soft text-accent-foreground",
        closed: "border-border bg-muted text-muted-foreground",
        reviewed: "border-success/25 bg-success-soft text-success",
        pending: "border-warning/40 bg-warning-soft text-warning-foreground",
        correction: "border-destructive/25 bg-destructive-soft text-destructive",
        processing: "border-info/25 bg-info-soft text-info",
        flood: "border-water/25 bg-water-soft text-info",
        fire: "border-burn/30 bg-burn-soft text-burn",
        experimental: "border-warning/40 bg-warning-soft text-warning-foreground",
        demo: "border-navy-line/30 bg-secondary text-secondary-foreground font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
