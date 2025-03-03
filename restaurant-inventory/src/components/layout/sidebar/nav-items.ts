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
            { name: "Inventory", href: "/inventory", icon: PackageIcon },
            { name: "Suppliers", href: "/suppliers", icon: Truck },
            { name: "Shopping List", href: "/shopping-list", icon: ShoppingBagIcon },
        ],
    },
    {
        name: "Menu & Sales",
        icon: ShoppingCartIcon,
        className: "mt-2",
        items: [
            { name: "Recipes", href: "/recipes", icon: BookOpenIcon },
            { name: "Sales", href: "/sales", icon: ShoppingCartIcon },
        ],
    },
    {
        name: "Analytics",
        icon: BarChart2Icon,
        className: "mt-2",
        items: [
            { name: "Reports", href: "/reports", icon: BarChart2Icon },
            { name: "Notes", href: "/notes", icon: MessageSquareIcon },
        ],
    },
    {
        name: "Administration",
        icon: SettingsIcon,
        className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 opacity-90",
        items: [
            { name: "Users", href: "/users", icon: UsersIcon },
            { name: "Billing", href: "/billing", icon: CreditCardIcon },
            { name: "Settings", href: "/settings", icon: SettingsIcon },
            { name: "Help", href: "/help", icon: HelpCircleIcon },
        ],
    },
]; 