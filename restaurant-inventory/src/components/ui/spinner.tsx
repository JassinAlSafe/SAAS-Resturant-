import React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-3",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground/70",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "muted";
  className?: string;
}

export function Spinner({
  size,
  variant,
  className,
  ...props
}: SpinnerProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  );
}
