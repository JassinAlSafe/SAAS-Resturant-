import { LucideIcon } from "lucide-react";

export interface BaseNavItem {
    name: string;
    icon?: LucideIcon;
    className?: string;
}

export interface NavItemWithHref extends BaseNavItem {
    href: string;
}

export interface NavItemWithChildren extends BaseNavItem {
    items: (NavItemWithHref | NavItemWithChildren)[];
}

export type NavItem = NavItemWithHref | NavItemWithChildren;

// Type guard to check if a NavItem has children
export function hasChildren(item: NavItem): item is NavItemWithChildren {
    return 'items' in item && Array.isArray(item.items);
} 