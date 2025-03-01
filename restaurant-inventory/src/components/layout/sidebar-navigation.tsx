"use client";

import * as React from "react";
import {
  HomeIcon,
  PackageIcon,
  BarChart2Icon,
  ChevronLeftIcon,
  MenuIcon,
  LogOutIcon,
  ShoppingCartIcon,
  SettingsIcon,
  BookOpenIcon,
  SearchIcon,
  BellIcon,
  RefreshCwIcon,
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

// Add CSS to fix the sidebar width issue
const sidebarStyles = `
  /* Ensure the main content takes full width */
  .main-content {
    width: 100% !important;
  }
`;

// Navigation items with their paths and icons
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Inventory", href: "/inventory", icon: PackageIcon },
  { name: "Recipes", href: "/recipes", icon: BookOpenIcon },
  { name: "Sales", href: "/sales", icon: ShoppingCartIcon },
  { name: "Reports", href: "/reports", icon: BarChart2Icon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

// Navigation component with active state detection
function Navigation({ sidebarContext }: { sidebarContext: any }) {
  const pathname = usePathname();
  const { open } = sidebarContext;

  return (
    <ul className="px-3 flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <li key={item.href} className="my-1.5 group/menu-item relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`sidebar-item flex items-center ${
                    open ? "justify-start" : "justify-center"
                  } rounded-md px-3 py-2.5 transition-colors ${
                    isActive
                      ? "sidebar-item-active"
                      : "hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-foreground))]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${open ? "mr-3" : ""} ${
                      isActive
                        ? "sidebar-item-icon-active"
                        : "sidebar-item-icon"
                    }`}
                  />
                  {open && (
                    <span
                      className={`font-medium text-sm truncate ${
                        isActive
                          ? "text-[hsl(var(--sidebar-active-text))]"
                          : "text-[hsl(var(--sidebar-foreground))]"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right" className="font-medium">
                  {item.name}
                </TooltipContent>
              )}
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}

// User profile component
function UserProfile({ sidebarContext }: { sidebarContext: any }) {
  const { open } = sidebarContext;
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="p-3 border-t border-[hsl(var(--sidebar-border))]">
      <div className="flex items-center justify-center">
        <div
          className={`${
            open
              ? "flex items-center w-full"
              : "flex flex-col items-center w-full"
          }`}
        >
          <div className="h-8 w-8 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))] shadow-sm flex-shrink-0">
            <span className="text-xs font-semibold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          {open && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate text-[hsl(var(--sidebar-foreground))]">
                {profile?.name || "User"}
              </p>
              <p className="text-xs text-[hsl(var(--sidebar-muted))] truncate">
                {profile?.email || "user@example.com"}
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        className={`mt-3 flex ${open ? "justify-between" : "justify-center"}`}
      >
        {open ? (
          <>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-xs text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] p-2 rounded-md hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
            >
              <LogOutIcon size={14} />
              <span>Log out</span>
            </button>
            <ThemeToggle />
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center text-xs text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-foreground))] p-2 rounded-md hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
                >
                  <LogOutIcon size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Log out</TooltipContent>
            </Tooltip>
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  );
}

// Main sidebar layout component
function SidebarLayout() {
  // Since we removed SidebarProvider, we need to manage state directly
  const [open, setOpen] = React.useState(false);
  const children = React.useContext(SidebarChildrenContext);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
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
  const sidebarContext = {
    open,
    setOpen,
    state: open ? "expanded" : "collapsed",
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar: () =>
      isMobile ? setOpenMobile(!openMobile) : setOpen(!open),
  };

  const handleLogout = async () => {
    try {
      await signOut?.();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <TooltipProvider>
      <>
        {/* Style tag to fix sidebar width issue */}
        <style dangerouslySetInnerHTML={{ __html: sidebarStyles }} />

        {/* Icon-only sidebar - always visible on desktop */}
        <div className="hidden md:flex flex-col w-16 h-full border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] flex-shrink-0">
          {/* Logo */}
          <div className="flex justify-center py-4">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))]">
              <span className="text-sm font-bold">S</span>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col items-center gap-5 mt-4 flex-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-icon-active))]"
                          : "text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* User profile */}
          <div className="mt-auto flex flex-col items-center gap-4 pb-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))] cursor-pointer">
                  <span className="text-xs font-semibold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "J"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {profile?.name || "User Profile"}
              </TooltipContent>
            </Tooltip>
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
              <div className="md:hidden w-8 h-8 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))]">
                <span className="text-xs font-semibold">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "J"}
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
            className="w-12 h-12 rounded-full bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] flex items-center justify-center shadow-lg"
          >
            <MenuIcon size={24} />
          </Button>
        </div>

        {/* Mobile sidebar */}
        {isMobile && openMobile && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed inset-y-0 left-0 w-64 bg-[hsl(var(--sidebar))] p-4">
              <div className="flex items-center justify-between h-14 border-b border-[hsl(var(--sidebar-border))]">
                <h1 className="text-lg font-bold truncate text-[hsl(var(--sidebar-primary))]">
                  ShelfWise
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenMobile(false)}
                >
                  <ChevronLeftIcon />
                </Button>
              </div>
              <div className="py-3 flex-1 overflow-y-auto">
                <Navigation sidebarContext={sidebarContext} />
              </div>
              <div className="mt-auto">
                <UserProfile sidebarContext={sidebarContext} />
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
