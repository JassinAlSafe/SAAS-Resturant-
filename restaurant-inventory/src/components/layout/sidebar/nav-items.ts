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

import { NavItem } from "./types";

// Centralized navigation items with their paths and icons
export const navItems: NavItem[] = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
    },
    {
        name: "Inventory Management",
        icon: PackageIcon,
        className: "mt-2",
        items: [
            { name: "Inventory", href: "/inventory" },
            { name: "Suppliers", href: "/suppliers" },
            { name: "Shopping List", href: "/shopping-list" },
        ],
    },
    {
        name: "Menu & Sales",
        icon: ShoppingCartIcon,
        className: "mt-2",
        items: [
            { name: "Recipes", href: "/recipes" },
            { name: "Sales", href: "/sales" },
        ],
    },
    {
        name: "Analytics",
        icon: BarChart2Icon,
        className: "mt-2",
        items: [
            { name: "Reports", href: "/reports" },
            { name: "Notes", href: "/notes" },
        ],
    },
    {
        name: "Administration",
        icon: SettingsIcon,
        className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 opacity-90",
        items: [
            { name: "Users", href: "/users" },
            { name: "Billing", href: "/billing" },
            { name: "Settings", href: "/settings" },
            { name: "Help", href: "/help" },
        ],
    },
]; 