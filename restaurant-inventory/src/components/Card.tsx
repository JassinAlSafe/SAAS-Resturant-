import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Define card variants with more modern styling
const cardVariants = cva(
  "rounded-xl border bg-card overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm hover:shadow-md",
        elevated: "bg-card shadow-md hover:shadow-lg",
        outlined: "bg-card/50 border-border/50 hover:border-border/80",
        ghost: "bg-transparent border-transparent shadow-none",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-5 sm:p-6",
        lg: "p-6 sm:p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  headerClassName?: string;
  footerClassName?: string;
  hoverEffect?: boolean;
}

export default function Card({
  title,
  description,
  footer,
  isLoading,
  children,
  headerAction,
  className,
  contentClassName,
  noPadding = false,
  variant = "default",
  padding,
  headerClassName,
  footerClassName,
  hoverEffect = true,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({ variant, padding }),
        hoverEffect && "hover:border-primary/20 transition-all duration-300",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b",
            padding === "none" ? "p-5 sm:p-6" : "",
            headerClassName
          )}
        >
          <div className="space-y-1">
            {title && (
              <h3 className="text-base sm:text-lg font-semibold leading-tight text-foreground break-words">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground break-words">
                {description}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex justify-end sm:justify-start flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex flex-col",
          !noPadding && padding === "none" ? "p-5 sm:p-6" : "",
          contentClassName
        )}
      >
        {isLoading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </div>
      {footer && (
        <div
          className={cn(
            "border-t bg-muted/10",
            padding === "none" ? "p-5 sm:p-6" : "",
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
