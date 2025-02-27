"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
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
function Navigation() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarMenu className="px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.href} className="my-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        open ? "justify-start" : "justify-center"
                      } rounded-md px-3 py-2 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${open ? "mr-3" : ""} ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      {open && (
                        <span
                          className={`font-medium truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </TooltipProvider>
  );
}

// Sidebar toggle arrow component
function SidebarToggleArrow() {
  const { toggleSidebar, open } = useSidebar();

  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleSidebar}
            className={`flex items-center justify-center h-10 w-5 rounded-l-md bg-primary/10 hover:bg-primary/20 transition-all duration-200 shadow-sm ${
              open ? "translate-x-0" : "translate-x-1/2"
            }`}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <ChevronLeftIcon size={16} className="text-primary" />
            ) : (
              <ChevronRightIcon size={16} className="text-primary" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {open ? "Collapse sidebar" : "Expand sidebar"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// User profile component
function UserProfile() {
  const { open } = useSidebar();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="p-3 border-t border-border">
      <div className="flex items-center justify-center">
        <div
          className={`${
            open
              ? "flex items-center w-full"
              : "flex flex-col items-center w-full"
          }`}
        >
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm flex-shrink-0">
            <span className="text-sm font-semibold">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          {open && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate text-foreground">
                {profile?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
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
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors"
            >
              <LogOutIcon size={16} />
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
                  className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <LogOutIcon size={16} />
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
  const { open } = useSidebar();
  const children = React.useContext(SidebarChildrenContext);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/30">
      <div className="relative hidden md:block">
        <Sidebar
          collapsible="icon"
          className={`border-r border-border h-full transition-all duration-300 ease-in-out ${
            open ? "w-64" : "w-16"
          }`}
        >
          <SidebarHeader className="flex items-center justify-between p-4 h-14 border-b border-border bg-card">
            {open ? (
              <h1 className="text-lg font-bold truncate text-foreground">
                ShelfWise
              </h1>
            ) : (
              <div className="w-full flex justify-center">
                <h1 className="text-lg font-bold text-foreground">S</h1>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent className="py-2 flex-1 overflow-y-auto bg-card">
            <Navigation />
          </SidebarContent>
          <SidebarFooter className="mt-auto bg-card">
            <UserProfile />
          </SidebarFooter>
        </Sidebar>
        <SidebarToggleArrow />
      </div>
      <div className="flex-1 overflow-auto w-full flex flex-col">
        <div className="flex items-center justify-between p-4 h-14 border-b border-border bg-card md:hidden">
          <h1 className="text-lg font-bold truncate text-foreground">
            ShelfWise
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SidebarTrigger className="p-2 rounded-md hover:bg-muted">
              <MenuIcon size={20} />
            </SidebarTrigger>
          </div>
        </div>
        <main className="p-4 md:p-6 pb-16 md:pb-24 w-full flex-1">
          <div className="w-full max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Create a context to pass children down to the SidebarLayout
const SidebarChildrenContext = React.createContext<React.ReactNode>(null);

export function SidebarNavigation({ children }: { children: React.ReactNode }) {
  return (
    <SidebarChildrenContext.Provider value={children}>
      <SidebarProvider defaultOpen={true} className="w-full">
        <SidebarLayout />
      </SidebarProvider>
    </SidebarChildrenContext.Provider>
  );
}
