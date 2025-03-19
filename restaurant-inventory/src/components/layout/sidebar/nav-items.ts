import {
    HomeIcon,
    PackageIcon,
    BarChart2Icon,
    ShoppingCartIcon,
    SettingsIcon,
    MessageSquareIcon,
    BoxIcon,
    TruckIcon,
    ListIcon,
    UtensilsIcon,
    DollarSignIcon,
    FileTextIcon,
    UserIcon,
    CreditCardIcon as BillingIcon,
    ActivityIcon,
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
            { name: "Inventory", href: "/inventory", icon: BoxIcon },
            { name: "Suppliers", href: "/suppliers", icon: TruckIcon },
            { name: "Shopping List", href: "/shopping-list", icon: ListIcon },
        ],
    },
    {
        name: "Menu & Sales",
        icon: ShoppingCartIcon,
        className: "mt-2",
        items: [
            { name: "Recipes", href: "/recipes", icon: UtensilsIcon },
            { name: "Sales", href: "/sales", icon: DollarSignIcon },
        ],
    },
    {
        name: "Analytics",
        icon: BarChart2Icon,
        className: "mt-2",
        items: [
            { name: "Reports", href: "/reports", icon: FileTextIcon },
            { name: "Notes", href: "/notes", icon: MessageSquareIcon },
        ],
    },
    {
        name: "Administration",
        icon: SettingsIcon,
        className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 opacity-90",
        items: [
            { name: "Users", href: "/users", icon: UserIcon },
            { name: "Billing", href: "/billing", icon: BillingIcon },
            { name: "Test Connection", href: "/test-connection", icon: ActivityIcon },
        ],
    },
]; 