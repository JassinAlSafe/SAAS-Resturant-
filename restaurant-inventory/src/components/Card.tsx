import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        sm: "p-0",
        md: "p-0",
        lg: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
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

export default function CardComponent({
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
    <ShadcnCard
      className={cn(
        cardVariants({ variant, padding }),
        hoverEffect && "hover:border-primary/20 transition-all duration-300",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <CardHeader className={cn(headerClassName)}>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1.5">
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">{headerAction}</div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(noPadding && "p-0", contentClassName)}>
        {isLoading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>

      {footer && (
        <CardFooter className={cn("bg-muted/10", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </ShadcnCard>
  );
}
