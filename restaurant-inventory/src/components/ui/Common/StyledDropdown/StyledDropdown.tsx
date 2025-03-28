import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  /**
   * Label text for the dropdown item
   */
  label: string;

  /**
   * Icon to display before the dropdown item label
   */
  icon?: ReactNode;

  /**
   * Function to execute when the dropdown item is clicked
   */
  onClick: () => void;

  /**
   * Optional CSS class for the dropdown item
   */
  className?: string;

  /**
   * Whether the dropdown item is disabled
   */
  disabled?: boolean;

  /**
   * Whether this item should be rendered as a separator
   */
  isSeparator?: boolean;
}

export interface StyledDropdownProps {
  /**
   * Array of dropdown items to display in the menu
   */
  items: DropdownItem[];

  /**
   * The text to display on the dropdown trigger button
   */
  label: string;

  /**
   * Optional icon to display on the trigger button
   */
  icon?: ReactNode;

  /**
   * Whether to show a dropdown chevron icon
   * @default true
   */
  showChevron?: boolean;

  /**
   * Button size
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "xs" | "md";

  /**
   * Dropdown menu alignment
   * @default "center"
   */
  align?: "start" | "center" | "end";

  /**
   * Additional CSS classes for the trigger button
   */
  className?: string;

  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;

  /**
   * Trigger button variant
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

  /**
   * Width of the dropdown menu
   * @default "56"
   */
  menuWidth?: string;
}

/**
 * A modern, minimalistic styled dropdown component
 */
export function StyledDropdown({
  items,
  label,
  icon,
  showChevron = true,
  size = "default",
  align = "center",
  className,
  disabled = false,
  variant = "ghost",
  menuWidth = "56",
}: StyledDropdownProps) {
  // Filter out separators to check if we have actual items
  const actionableItems = items.filter((item) => !item.isSeparator);

  return (
    <DropdownMenu align={align}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "flex items-center gap-2 border-0 hover:bg-secondary/80 text-foreground",
            className
          )}
          disabled={disabled || actionableItems.length === 0}
        >
          {icon && <span className="mr-1">{icon}</span>}
          <span>{label}</span>
          {showChevron && <ChevronDown className="h-4 w-4 opacity-70" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "bg-white border-0 shadow-lg rounded-md p-1 z-50",
          `w-${menuWidth}`
        )}
      >
        {items.map((item, index) => {
          if (item.isSeparator) {
            return (
              <DropdownMenuSeparator
                key={`sep-${index}`}
                className="my-1 bg-gray-100"
              />
            );
          }

          return (
            <DropdownMenuItem
              key={`item-${index}-${item.label}`}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "flex items-center gap-2 cursor-pointer py-2 px-3 text-gray-800 hover:bg-gray-50 rounded-sm transition-colors duration-150",
                item.className
              )}
            >
              {item.icon && (
                <span className="h-4 w-4 text-gray-600">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
