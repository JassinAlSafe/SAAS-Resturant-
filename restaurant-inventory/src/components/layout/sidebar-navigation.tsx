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
    dark:background-color: rgba(255, 255, 255, 0.1);
  }
  
  /* Custom styling for the user profile */
  .user-profile {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    dark:border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: auto;
    padding-top: 12px;
  }
  
  /* Smooth transitions */
  .sidebar-transition {
    transition: all 0.3s ease;
  }
  
  /* Mobile optimizations */
  @media (max-width: 1024px) {
    .sidebar-container {
      width: 100%;
      max-width: 280px;
    }
    
    .nav-item button, .nav-item a {
      padding: 12px 16px;
    }
    
    .mobile-sidebar-overlay {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    .mobile-sidebar-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 50;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
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
                  w-full flex items-center justify-between px-3 py-2 rounded-md text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${isActive ? "bg-gray-100 dark:bg-gray-800 text-primary" : ""}
                  ${open ? "" : "justify-center"}
                  transition-colors
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-primary"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                  {open && <span>{item.name}</span>}
                </div>
                {open && (
                  <ChevronDownIcon
                    size={16}
                    className={`transform transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {open && (
                <ul className="mt-1 ml-7 space-y-1">
                  {item.items.map((child) => renderNavItem(child, depth + 1))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </li>
      );
    }

    // Item with href (leaf node)
    const isActive =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    return (
      <li key={item.name} className={`nav-item ${item.className || ""}`}>
        <Link
          href={item.href}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-sm
            hover:bg-gray-100 dark:hover:bg-gray-800
            ${isActive ? "bg-gray-100 dark:bg-gray-800 text-primary" : ""}
            ${open ? "" : "justify-center"}
            transition-colors
          `}
        >
          <Icon
            size={20}
            className={
              isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"
            }
          />
          {open && <span>{item.name}</span>}
        </Link>
      </li>
    );
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
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [state, setState] = React.useState<"expanded" | "collapsed">(
    "expanded"
  );
  const children = React.useContext(SidebarChildrenContext);
  const { profile } = useAuth();

  // Check if we're on mobile on component mount and window resize
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // Increased breakpoint to include tablets
      setIsMobile(mobile);

      // Only force sidebar state on initial detection of mobile/desktop
      // Don't override user's preference when resizing
      if (mobile && !isMobile) {
        // When switching from desktop to mobile, close the sidebar
        setOpen(false);
      }
    };

    // Run once on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, isMobile]);

  // Get the saved sidebar state from localStorage when component mounts
  React.useEffect(() => {
    // Only read local storage on desktop
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebar_state");
      if (savedState) {
        setOpen(savedState === "true");
      }
    }
  }, [isMobile]);

  // Update state when open changes
  React.useEffect(() => {
    setState(open ? "expanded" : "collapsed");
  }, [open]);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      const newState = !open;
      setOpen(newState);
      // Save sidebar state to localStorage for desktop
      localStorage.setItem("sidebar_state", String(newState));
    }
  };

  // Create sidebar context with our state
  const sidebarContext: SidebarContextType = {
    open,
    setOpen,
    state,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* For desktop: normal sidebar */}
        {!isMobile && (
          <div
            className={`sidebar-container sidebar-transition ${
              open ? "w-64" : "w-16"
            } h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-30 fixed top-0 left-0`}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-between">
                {open && (
                  <div className="text-lg font-semibold">
                    Restaurant Inventory
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                  className={`${
                    open ? "ml-auto" : "mx-auto"
                  } hover:bg-gray-100 dark:hover:bg-gray-800`}
                >
                  {open ? (
                    <ChevronLeftIcon size={18} />
                  ) : (
                    <ChevronRightIcon size={18} />
                  )}
                </Button>
              </div>
              <Navigation sidebarContext={sidebarContext} />
              <UserProfile sidebarContext={sidebarContext} />
            </div>
          </div>
        )}

        {/* For mobile: sheet/dialog style sidebar with overlay */}
        {isMobile && openMobile && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50 mobile-sidebar-overlay transition-opacity"
              onClick={() => setOpenMobile(false)}
            />
            <div className="fixed inset-y-0 left-0 w-full max-w-[280px] bg-white dark:bg-gray-950 shadow-xl flex flex-col h-full z-50">
              <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                <div className="text-lg font-semibold">
                  Restaurant Inventory
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenMobile(false)}
                  aria-label="Close sidebar"
                >
                  <ChevronLeftIcon size={18} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Navigation
                  sidebarContext={{ ...sidebarContext, open: true }}
                />
              </div>
              <UserProfile sidebarContext={{ ...sidebarContext, open: true }} />
            </div>
          </div>
        )}

        {/* Mobile toggle button - only visible on mobile */}
        {isMobile && !openMobile && (
          <Button
            className="mobile-sidebar-toggle rounded-full p-3 bg-primary text-white shadow-lg"
            onClick={() => setOpenMobile(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={24} />
          </Button>
        )}

        {/* Main content */}
        <div className="flex-1 h-screen overflow-hidden">
          <div
            className={`main-content h-full overflow-auto bg-gray-50 dark:bg-gray-900 transition-all duration-200 ease-in-out ${
              !isMobile ? (open ? "ml-64" : "ml-16") : ""
            }`}
          >
            <div className="min-h-full">
              {isMobile && (
                <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                  <div className="text-lg font-semibold">
                    Restaurant Inventory
                  </div>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </div>
              )}
              {!isMobile && (
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>
              )}
              <main className="p-4 md:p-6">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Create a context to pass children down to the SidebarLayout
const SidebarChildrenContext = React.createContext<React.ReactNode>(null);

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  return (
    <SidebarChildrenContext.Provider value={children}>
      <SidebarLayout />
    </SidebarChildrenContext.Provider>
  );
}
