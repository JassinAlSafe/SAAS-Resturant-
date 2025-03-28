import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  /**
   * The callback function to execute when the refresh button is clicked
   */
  onRefresh: () => void;

  /**
   * Whether the refresh operation is currently in progress
   */
  isRefreshing?: boolean;

  /**
   * Custom label text for the button
   * @default "Refresh Data"
   */
  label?: string;

  /**
   * Additional CSS classes to apply to the button
   */
  className?: string;

  /**
   * Button size variant
   * @default "sm"
   */
  size?: "default" | "sm" | "lg" | "xs" | "md";

  /**
   * Button variant style
   * @default "ghost"
   */
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "primary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
}

/**
 * A reusable button component for refreshing data with loading state
 * Styled with modern, minimalistic look and no borders by default
 */
export function RefreshButton({
  onRefresh,
  isRefreshing = false,
  label = "Refresh Data",
  className,
  size = "sm",
  variant = "ghost",
}: RefreshButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRefresh}
      disabled={isRefreshing}
      className={cn("gap-2 hover:bg-secondary/80 text-foreground", className)}
      aria-label={isRefreshing ? "Refreshing data" : "Refresh data"}
    >
      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      {isRefreshing ? "Refreshing..." : label}
    </Button>
  );
}
