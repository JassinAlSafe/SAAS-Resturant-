import React, { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  StyledDropdown,
  DropdownItem,
} from "@/components/ui/Common/StyledDropdown";

/**
 * ActionItem type is an alias for DropdownItem
 * This allows backward compatibility with existing code while
 * ensuring type safety with the new StyledDropdown component
 */
export type ActionItem = DropdownItem;

export interface ActionsButtonProps {
  /**
   * Array of action items to display in the dropdown
   */
  actions: ActionItem[];

  /**
   * Button label text
   * @default "Actions"
   */
  label?: string;

  /**
   * Whether to show the label text alongside the icon
   * @default true
   */
  showLabel?: boolean;

  /**
   * Icon to display on the button
   * @default <MoreHorizontal />
   */
  icon?: ReactNode;

  /**
   * Additional CSS classes for the button
   */
  className?: string;

  /**
   * Button size variant
   * @default "sm"
   */
  size?: "default" | "sm" | "lg" | "xs" | "md";

  /**
   * Button variant style
   * @default "outline"
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

  /**
   * Dropdown menu alignment
   * @default "end"
   */
  align?: "start" | "end" | "center";

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

/**
 * A reusable dropdown button for displaying a list of actions
 * Uses StyledDropdown internally for consistent styling
 */
export function ActionsButton({
  actions,
  label = "Actions",
  showLabel = true,
  icon = <MoreHorizontal className="h-4 w-4" />,
  className,
  size = "sm",
  variant = "outline",
  align = "end",
  disabled = false,
}: ActionsButtonProps) {
  return (
    <StyledDropdown
      items={actions}
      label={showLabel ? label : ""}
      icon={icon}
      showChevron={false} // ActionsButton traditionally doesn't show a chevron
      size={size}
      align={align}
      className={className}
      disabled={disabled}
      variant={variant}
    />
  );
}
