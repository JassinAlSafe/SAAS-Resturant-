import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?:
    | "ghost"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  inputSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize = "md", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "input",
          {
            "input-ghost": variant === "ghost",
            "input-primary": variant === "primary",
            "input-secondary": variant === "secondary",
            "input-accent": variant === "accent",
            "input-info": variant === "info",
            "input-success": variant === "success",
            "input-warning": variant === "warning",
            "input-error": variant === "error",
            "input-xs": inputSize === "xs",
            "input-sm": inputSize === "sm",
            "input-md": inputSize === "md",
            "input-lg": inputSize === "lg",
            "input-xl": inputSize === "xl",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
