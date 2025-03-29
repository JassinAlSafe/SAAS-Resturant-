"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  hover?: boolean;
}

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  DropdownMenuProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, align = "start", hover = false, ...props }, ref) => {
  // Set alignment class based on the align prop
  const alignmentClass =
    align === "center"
      ? "dropdown-center"
      : align === "end"
      ? "dropdown-end"
      : "";

  return (
    <div
      ref={ref}
      className={cn(
        "dropdown",
        alignmentClass,
        hover && "dropdown-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DropdownMenu.displayName = "DropdownMenu";

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuTriggerProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "div";
  return (
    <Comp>
      <div
        ref={ref}
        tabIndex={0}
        role="button"
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    </Comp>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<
  HTMLUListElement,
  DropdownMenuContentProps & React.HTMLAttributes<HTMLUListElement>
>(({ children, className, sideOffset, ...props }, ref) => {
  // Apply sideOffset using inline style if provided
  const style =
    sideOffset !== undefined
      ? { marginTop: `${sideOffset}px`, ...props.style }
      : props.style;

  return (
    <ul
      ref={ref}
      tabIndex={0}
      style={style}
      className={cn(
        "dropdown-content z-[1] menu menu-sm bg-base-100 rounded-box shadow-lg p-2 w-56",
        className
      )}
      {...props}
    >
      {children}
    </ul>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  disabled?: boolean;
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLLIElement>) => void;
}

const DropdownMenuItem = React.forwardRef<
  HTMLLIElement,
  DropdownMenuItemProps & React.HTMLAttributes<HTMLLIElement>
>(
  (
    { children, className, inset, disabled, active, onClick, ...props },
    ref
  ) => {
    return (
      <li
        ref={ref}
        className={cn(disabled && "disabled", className)}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        <a className={cn(inset && "pl-8", active && "active")}>{children}</a>
      </li>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "menu-title text-xs font-medium text-base-content/60 px-2 py-1.5",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

interface DropdownMenuSeparatorProps {
  className?: string;
}

const DropdownMenuSeparator = React.forwardRef<
  HTMLLIElement,
  DropdownMenuSeparatorProps & React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("divider my-1", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

interface DropdownMenuShortcutProps {
  className?: string;
}

const DropdownMenuShortcut = ({
  className,
  ...props
}: DropdownMenuShortcutProps & React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs text-base-content/40 tracking-widest",
        className
      )}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Export all components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
};
