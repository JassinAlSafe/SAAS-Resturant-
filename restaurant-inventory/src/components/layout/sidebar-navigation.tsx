"use client";

import * as React from "react";
import {
  HomeIcon,
  PackageIcon,
  BarChart2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  LogOutIcon,
  ShoppingCartIcon,
  SettingsIcon,
  BookOpenIcon,
  SearchIcon,
  BellIcon,
  RefreshCwIcon,
  HelpCircleIcon,
  Truck,
  ShoppingBagIcon,
  MessageSquareIcon,
  UsersIcon,
  CreditCardIcon,
  ChevronDownIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition } from "@/components/ui/transition";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define the SidebarContext type
type SidebarContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  state: "expanded" | "collapsed";
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
};

// Add CSS to fix the sidebar width issue
const sidebarStyles = `
  /* Ensure the main content takes full width */
  .main-content {
    width: 100% !important;
  }
  
  /* Improve spacing for navigation items */
  .nav-item {
    margin-bottom: 8px;
  }
  
  /* Add gap for settings and help section */
  .nav-item-settings, .nav-item-help {
    margin-top: 24px;
    position: relative;
  }
  
  /* Add separator line above settings */
  .nav-item-settings:before {
    content: '';
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  /* Custom styling for the user profile */
  .user-profile {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: auto;
  }
  
  /* Smooth transitions */
  .sidebar-transition {
    transition: all 0.3s ease;
  }
`;

// Navigation items with their paths and icons
const navItems = [
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
type NavItemWithChildren = {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
  className?: string;
};

type NavItemWithHref = {
  name: string;
  href: string;
  icon: React.ElementType;
  className?: string;
};

type NavItem = NavItemWithHref | NavItemWithChildren;

// Helper function to check if a NavItem has children
const hasChildren = (item: NavItem): item is NavItemWithChildren => {
  return "items" in item && Array.isArray(item.items);
};

// Navigation component with active state detection
function Navigation({
  sidebarContext,
}: {
  sidebarContext: SidebarContextType;
}) {
  const pathname = usePathname();
  const { open } = sidebarContext;
  const { signOut } = useAuth();
  const { startTransition } = useTransition();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});

  // Check if any child item is active
  const isChildActive = (items: NavItem[]): boolean => {
    return items.some((item) => {
      if (hasChildren(item)) {
        return isChildActive(item.items);
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
  };

  // Toggle section expansion
  const toggleSection = (name: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Initialize expanded sections based on active path
  React.useEffect(() => {
    const newExpandedSections: Record<string, boolean> = {};

    navItems.forEach((item) => {
      if (hasChildren(item)) {
        const shouldExpand = isChildActive(item.items);
        if (shouldExpand) {
          newExpandedSections[item.name] = true;
        }
      }
    });

    setExpandedSections((prev) => ({
      ...prev,
      ...newExpandedSections,
    }));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      startTransition(() => {
        signOut()
          .then(() => {
            router.push("/login");
          })
          .catch((error) => {
            console.error("Error signing out:", error);
          });
      }, "logout");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderNavItem = (item: NavItem, depth = 0): React.ReactNode => {
    if (hasChildren(item)) {
      const isExpanded = expandedSections[item.name] || false;
      const isActive = isChildActive(item.items);
      const Icon = item.icon;

      return (
        <li key={item.name} className={`nav-item ${item.className || ""}`}>
          <Collapsible
            open={isExpanded}
            onOpenChange={() => toggleSection(item.name)}
          >
            <CollapsibleTrigger asChild>
              <button
                className={`
                  w-full flex items-center justify-between px-2 py-2 rounded-md
                  ${isActive ? "bg-gray-100 text-gray-900" : ""}
                  ${open ? "" : "justify-center"}
                `}
              >
                <div className="flex items-center">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-gray-900" : "text-gray-500"
                    }`}
                  />
                  {open && (
                    <span className="text-sm font-medium text-gray-900 ml-3">
                      {item.name}
                    </span>
                  )}
                </div>
                {open && (
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "transform rotate-180" : ""
                    }`}
                  />
                )}
              </button>
            </CollapsibleTrigger>

            {!open && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="sr-only">{item.name}</span>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium sidebar-tooltip"
                >
                  {item.name}
                </TooltipContent>
              </Tooltip>
            )}

            <CollapsibleContent>
              {open && (
                <ul className="pl-7 mt-1 space-y-1">
                  {item.items.map((childItem) =>
                    renderNavItem(childItem, depth + 1)
                  )}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </li>
      );
    } else {
      const isActive =
        pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;

      return (
        <li key={item.href} className={`nav-item ${item.className || ""}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={`
                  sidebar-transition flex items-center px-2 py-2 rounded-md
                  ${open ? "" : "justify-center"}
                  ${isActive ? "bg-gray-100 text-gray-900" : ""}
                `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                />
                {open && (
                  <span className="text-sm font-medium text-gray-900 ml-3">
                    {item.name}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            {!open && (
              <TooltipContent
                side="right"
                className="font-medium sidebar-tooltip"
              >
                {item.name}
              </TooltipContent>
            )}
          </Tooltip>
        </li>
      );
    }
  };

  return (
    <ul className="flex flex-col w-full px-4">
      {navItems.map((item) => renderNavItem(item))}

      {/* Logout button as a navigation item */}
      <li className="nav-item mt-8 border-t border-gray-200 pt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className={`
                sidebar-transition
                ${
                  open
                    ? "sidebar-expanded-item"
                    : "flex items-center justify-center h-10 w-10 mx-auto rounded-md"
                }
              `}
            >
              <LogOutIcon className="h-5 w-5 text-gray-500" />
              {open && (
                <span className="text-sm font-medium text-gray-900 ml-3">
                  Logout
                </span>
              )}
            </button>
          </TooltipTrigger>
          {!open && (
            <TooltipContent
              side="right"
              className="font-medium sidebar-tooltip"
            >
              Logout
            </TooltipContent>
          )}
        </Tooltip>
      </li>
    </ul>
  );
}

// User profile component
function UserProfile({
  sidebarContext,
}: {
  sidebarContext: SidebarContextType;
}) {
  const { open } = sidebarContext;
  const { profile } = useAuth();

  return (
    <div className="user-profile px-4 py-4">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 shadow-sm flex-shrink-0">
          <span className="text-sm font-semibold">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
          </span>
        </div>
        {open && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate text-gray-900">
              {profile?.name || "Sebastian Ekstrand"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email || "Region West, CU Frontend 2"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main sidebar layout component
function SidebarLayout() {
  // Since we removed SidebarProvider, we need to manage state directly
  const [open, setOpen] = React.useState(true); // Default to open for wider sidebar
  const children = React.useContext(SidebarChildrenContext);
  const { profile } = useAuth();
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [openMobile, setOpenMobile] = React.useState(false);

  // Add resize listener
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create a mock useSidebar context for components that need it
  const sidebarContext: SidebarContextType = {
    open,
    setOpen,
    state: open ? "expanded" : "collapsed",
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar: () =>
      isMobile ? setOpenMobile(!openMobile) : setOpen(!open),
  };

  return (
    <TooltipProvider>
      <>
        {/* Style tag to fix sidebar width issue */}
        <style dangerouslySetInnerHTML={{ __html: sidebarStyles }} />

        {/* Sidebar - desktop version */}
        <div
          className={`hidden md:flex flex-col h-full border-r border-gray-200 bg-white flex-shrink-0 sidebar-transition relative ${
            open ? "w-72" : "w-20"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            {open ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  ShelfWise
                </span>
                <span className="text-sm text-gray-500 ml-2">Inventory</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <span className="text-2xl font-bold text-gray-900">S</span>
              </div>
            )}
          </div>

          {/* Navigation - with more spacing between items */}
          <div className="flex-1 py-6">
            <Navigation sidebarContext={sidebarContext} />
          </div>

          {/* User profile - positioned at bottom */}
          <UserProfile sidebarContext={sidebarContext} />

          {/* Toggle button - positioned on the right edge of the sidebar */}
          <div className="absolute -right-4 top-20 z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8 border border-gray-200 bg-white shadow-sm flex items-center justify-center"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              {open ? (
                <ChevronLeftIcon size={16} />
              ) : (
                <ChevronRightIcon size={16} />
              )}
            </Button>
          </div>
        </div>

        {/* Main content area - using flex-1 to take up remaining space */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background main-content">
          {/* Header with search and notifications */}
          <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 flex-shrink-0">
            <h1 className="text-xl font-bold text-foreground">ShelfWise</h1>

            <div className="flex items-center gap-4">
              {/* Search bar */}
              <div className="relative hidden md:flex items-center">
                <div className="absolute left-3 text-muted-foreground">
                  <SearchIcon size={18} />
                </div>
                <Input
                  placeholder="Search Anything..."
                  className="w-64 pl-10 h-9 bg-background border-border"
                />
              </div>

              {/* Refresh button */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <RefreshCwIcon size={18} />
              </Button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notification bell */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <BellIcon size={18} />
              </Button>

              {/* User avatar (mobile only) */}
              <div className="md:hidden w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                <span className="text-xs font-semibold">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
                </span>
              </div>
            </div>
          </header>

          {/* Main content - using flex-1 to take up remaining space */}
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <div className="w-full h-full">{children}</div>
          </main>
        </div>

        {/* Mobile sidebar trigger */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => sidebarContext.toggleSidebar()}
            className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg"
          >
            <MenuIcon size={24} />
          </Button>
        </div>

        {/* Mobile sidebar */}
        {isMobile && openMobile && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed inset-y-0 left-0 w-72 bg-white p-0">
              {/* Logo */}
              <div className="flex items-center h-16 px-4 border-b border-gray-200">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    ShelfWise
                  </span>
                  <span className="text-sm text-gray-500 ml-2">Inventory</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenMobile(false)}
                  className="ml-auto text-gray-400"
                >
                  <ChevronLeftIcon />
                </Button>
              </div>

              {/* Navigation */}
              <div className="py-6">
                <Navigation
                  sidebarContext={{ ...sidebarContext, open: true }}
                />
              </div>

              {/* User profile */}
              <div className="absolute bottom-0 left-0 right-0">
                <UserProfile
                  sidebarContext={{ ...sidebarContext, open: true }}
                />
              </div>
            </div>
          </div>
        )}
      </>
    </TooltipProvider>
  );
}

// Create a context to pass children down to the SidebarLayout
const SidebarChildrenContext = React.createContext<React.ReactNode>(null);

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  return (
    <SidebarChildrenContext.Provider value={children}>
      {/* Use a direct flex layout instead of relying on the SidebarProvider's internal structure */}
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Our custom sidebar is already handling everything, so we don't need the SidebarProvider */}
        <SidebarLayout />
      </div>
    </SidebarChildrenContext.Provider>
  );
}
