import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
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
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b p-3 sm:p-6">
          <div>
            {title && (
              <h3 className="text-lg sm:text-xl font-semibold leading-tight text-foreground break-words">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1 break-words">
                {description}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex justify-end sm:justify-start">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "flex flex-col",
          noPadding ? "" : "p-3 sm:p-6",
          contentClassName
        )}
      >
        {isLoading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </div>
      {footer && (
        <div className="border-t p-3 sm:p-6 bg-muted/20">{footer}</div>
      )}
    </div>
  );
}
