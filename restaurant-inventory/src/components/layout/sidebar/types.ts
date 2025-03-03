import * as React from "react";

export type NavItemWithChildren = {
    name: string;
    icon: React.ElementType;
    items: NavItem[];
    className?: string;
};

export type NavItemWithHref = {
    name: string;
    href: string;
    icon?: React.ElementType;
    className?: string;
};

export type NavItem = NavItemWithHref | NavItemWithChildren;

// Helper function to check if a NavItem has children
export const hasChildren = (item: NavItem): item is NavItemWithChildren => {
    return "items" in item && Array.isArray(item.items);
}; 