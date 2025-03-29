import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "ghost"
    | "link"
    | "outline";
  size?: "default" | "xs" | "sm" | "md" | "lg" | "icon";
  shape?: "default" | "circle" | "square";
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      shape = "default",
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Map variants to DaisyUI classes
    const variantClasses = {
      default: "",
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      info: "btn-info",
      success: "btn-success",
      warning: "btn-warning",
      error: "btn-error",
      ghost: "btn-ghost",
      link: "btn-link",
      outline: "btn-outline",
    };

    // Map sizes to DaisyUI classes
    const sizeClasses = {
      default: "",
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
      icon: "btn-sm p-0", // Icon button - small size with no padding
    };

    // Map shapes to DaisyUI classes
    const shapeClasses = {
      default: "",
      circle: "btn-circle",
      square: "btn-square",
    };

    return (
      <Comp
        className={cn(
          "btn",
          variantClasses[variant],
          sizeClasses[size],
          shapeClasses[shape],
          loading && "loading",
          className
        )}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {!loading && children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
