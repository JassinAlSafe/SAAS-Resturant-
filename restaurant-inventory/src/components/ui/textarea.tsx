import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?:
    | "ghost"
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size = "md", ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "textarea",
          {
            "textarea-ghost": variant === "ghost",
            "textarea-primary": variant === "primary",
            "textarea-secondary": variant === "secondary",
            "textarea-accent": variant === "accent",
            "textarea-info": variant === "info",
            "textarea-success": variant === "success",
            "textarea-warning": variant === "warning",
            "textarea-error": variant === "error",
            "textarea-xs": size === "xs",
            "textarea-sm": size === "sm",
            "textarea-md": size === "md",
            "textarea-lg": size === "lg",
            "textarea-xl": size === "xl",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
