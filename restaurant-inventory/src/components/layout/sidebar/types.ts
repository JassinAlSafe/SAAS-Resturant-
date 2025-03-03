import * as React from "react";
import {
    HomeIcon,
    PackageIcon,
    BarChart2Icon,
    ShoppingCartIcon,
    SettingsIcon,
    BookOpenIcon,
    HelpCircleIcon,
    Truck,
    ShoppingBagIcon,
    MessageSquareIcon,
    UsersIcon,
    CreditCardIcon,
} from "lucide-react";

// Define the SidebarContext type
export type SidebarContextType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    state: "expanded" | "collapsed";
    isMobile: boolean;
    openMobile: boolean;
    setOpenMobile: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void);
    toggleSidebar: () => void;
};

// Navigation items with their paths and icons
export const navItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
    },
    {
        name: "Inventory Management",
        icon: PackageIcon,
        items: [
            { name: "Inventory", href: "/inventory", icon: PackageIcon },
            { name: "Suppliers", href: "/suppliers", icon: Truck },
            { name: "Shopping List", href: "/shopping-list", icon: ShoppingBagIcon },
        ],
    },
    {
        name: "Menu & Sales",
        icon: ShoppingCartIcon,
        items: [
            { name: "Recipes", href: "/recipes", icon: BookOpenIcon },
            { name: "Sales", href: "/sales", icon: ShoppingCartIcon },
        ],
    },
    {
        name: "Analytics",
        icon: BarChart2Icon,
        items: [
            { name: "Reports", href: "/reports", icon: BarChart2Icon },
            { name: "Notes", href: "/notes", icon: MessageSquareIcon },
        ],
    },
    {
        name: "Administration",
        icon: SettingsIcon,
        className: "nav-item-settings",
        items: [
            { name: "Users", href: "/users", icon: UsersIcon },
            { name: "Billing", href: "/billing", icon: CreditCardIcon },
            { name: "Settings", href: "/settings", icon: SettingsIcon },
            { name: "Help", href: "/help", icon: HelpCircleIcon },
        ],
    },
];

// Define types for navigation items
export type NavItemWithChildren = {
    name: string;
    icon: React.ElementType;
    items: NavItem[];
    className?: string;
};

export type NavItemWithHref = {
    name: string;
    href: string;
    icon: React.ElementType;
    className?: string;
};

export type NavItem = NavItemWithHref | NavItemWithChildren;

// Helper function to check if a NavItem has children
export const hasChildren = (item: NavItem): item is NavItemWithChildren => {
    return "items" in item && Array.isArray(item.items);
};

// Create a context to pass children down to the SidebarLayout
export const SidebarChildrenContext = React.createContext<React.ReactNode>(null); 