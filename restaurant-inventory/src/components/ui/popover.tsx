"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export interface PopoverContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

/**
 * Popover component using DaisyUI styling
 * Provides similar functionality to Radix UI's Popover
 */
const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLElement | null>;
}>({
  open: false,
  setOpen: () => {},
  triggerRef: React.createRef(),
});

const Popover = ({
  children,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      if (onOpenChange) {
        const newValue = typeof value === "function" ? value(open) : value;
        onOpenChange(newValue);
      }
    },
    [isControlled, onOpenChange, open]
  );

  // Close popover when clicking outside
  React.useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !document.querySelector("[data-popover-content]")?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild = false, className }, forwardedRef) => {
    const { open, setOpen, triggerRef } = React.useContext(PopoverContext);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(!open);
    };

    const ref = React.useCallback(
      (node: HTMLButtonElement | null) => {
        // Store in the context ref
        triggerRef.current = node;

        // Forward the ref
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, triggerRef]
    );

    if (asChild && React.isValidElement(children)) {
      // Safe assertion since we check isValidElement
      const childElement = children as React.ReactElement<{
        className?: string;
        onClick?: React.MouseEventHandler;
      }>;
      const props = {
        onClick: handleClick,
        "aria-expanded": open,
        "aria-haspopup": true,
        className: cn(childElement.props.className, className),
      };

      return React.cloneElement(childElement, props);
    }

    return (
      <button
        ref={ref}
        className={className}
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup={true}
        type="button"
      >
        {children}
      </button>
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    { className, children, align = "center", sideOffset = 4, ...props },
    ref
  ) => {
    const { open } = React.useContext(PopoverContext);

    if (!open) return null;

    // Map alignment values to class names
    const alignClass =
      align === "start"
        ? "dropdown-start"
        : align === "end"
        ? "dropdown-end"
        : "";

    return (
      <div
        ref={ref}
        data-popover-content
        className={cn(
          "dropdown-content z-50 menu p-4 shadow bg-base-100 rounded-box border border-base-300",
          "opacity-100 visible scale-100", // Always visible when rendered
          alignClass,
          className
        )}
        style={{
          marginTop: sideOffset,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

// Popover anchor is just a div for positioning
const PopoverAnchor = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("relative", className)} {...props} />;
});

PopoverAnchor.displayName = "PopoverAnchor";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
