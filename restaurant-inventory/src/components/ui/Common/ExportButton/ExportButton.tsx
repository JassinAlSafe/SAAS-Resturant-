import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExportButtonAppearance = "minimal" | "outlined" | "solid";

export interface ExportButtonProps extends Omit<ButtonProps, "size"> {
  label?: string;
  iconSize?: number;
  iconClassName?: string;
  size?: "sm" | "md" | "lg" | "icon";
  onExport?: () => void | Promise<void>;
  isLoading?: boolean;
  title?: string;
  appearance?: ExportButtonAppearance;
}

export function ExportButton({
  label = "Export",
  iconSize = 4,
  iconClassName = "",
  size = "sm",
  variant,
  className = "",
  onExport,
  isLoading,
  title,
  disabled,
  appearance = "minimal",
  ...props
}: ExportButtonProps) {
  const buttonStyles = {
    sm: "h-8",
    md: "h-9",
    lg: "h-10",
    icon: "h-9 w-9 p-0",
  };

  // Map our custom sizes to Button component supported sizes
  const buttonSizeMap: Record<string, ButtonProps["size"]> = {
    sm: "sm",
    md: "md",
    lg: "lg",
    icon: "sm", // Map "icon" size to "sm" for Button component
  };

  // Determine style based on appearance
  const getStylesByAppearance = () => {
    switch (appearance) {
      case "minimal":
        return {
          variant: "ghost" as const,
          className: "hover:bg-secondary/80 text-foreground",
        };
      case "outlined":
        return {
          variant: "outline" as const,
          className: "border border-gray-300 hover:bg-gray-50 text-gray-700",
        };
      case "solid":
        return {
          variant: "default" as const,
          className: "bg-primary hover:bg-primary/90 text-white",
        };
      default:
        return {
          variant: "ghost" as const,
          className: "hover:bg-secondary/80 text-foreground",
        };
    }
  };

  const appearanceStyles = getStylesByAppearance();
  const buttonVariant = variant || appearanceStyles.variant;

  const handleClick = () => {
    if (onExport && !disabled && !isLoading) {
      onExport();
    }
  };

  return (
    <Button
      variant={buttonVariant}
      size={buttonSizeMap[size]}
      className={cn(buttonStyles[size], appearanceStyles.className, className)}
      onClick={handleClick}
      disabled={isLoading || disabled}
      title={title}
      {...props}
    >
      {isLoading ? (
        <Loader2
          className={`h-${iconSize} w-${iconSize} animate-spin ${
            size !== "icon" ? "mr-2" : ""
          } ${iconClassName}`}
        />
      ) : (
        <Download
          className={`h-${iconSize} w-${iconSize} ${
            size !== "icon" ? "mr-2" : ""
          } ${iconClassName}`}
        />
      )}
      {size !== "icon" && (label || "Export")}
    </Button>
  );
}
