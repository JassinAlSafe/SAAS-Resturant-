"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CollapsibleProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Collapsible = React.forwardRef<
  HTMLDivElement,
  CollapsibleProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, defaultOpen, open, onOpenChange, ...props }, ref) => {
  // Use controlled state if open prop is provided, otherwise use uncontrolled with defaultOpen
  const [isOpen, setIsOpen] = React.useState(defaultOpen || false);

  // Handle open state changes from props
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Function to toggle collapse state
  const toggleOpen = React.useCallback(() => {
    const newState = !isOpen;
    if (open === undefined) {
      setIsOpen(newState);
    }
    onOpenChange?.(newState);
  }, [isOpen, open, onOpenChange]);

  return (
    <div
      ref={ref}
      className={cn(
        "collapse",
        isOpen && "collapse-open",
        !isOpen && "collapse-close",
        className
      )}
      onClick={toggleOpen}
      {...props}
    >
      {children}
    </div>
  );
});
Collapsible.displayName = "Collapsible";

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  arrow?: boolean;
  plus?: boolean;
}

const CollapsibleTrigger = React.forwardRef<
  HTMLDivElement,
  CollapsibleTriggerProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, arrow, plus, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "collapse-title",
        arrow && "collapse-arrow",
        plus && "collapse-plus",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("collapse-content", className)} {...props}>
      {children}
    </div>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
