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
  SearchIcon,
  BellIcon,
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
      <SidebarMenu className="px-5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.href} className="my-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        open ? "justify-start" : "justify-center"
                      } rounded-2xl px-4 py-3 transition-all duration-300 ${
                        isActive
                          ? "bg-muted/80 text-primary"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center ${
                          isActive ? "bg-background shadow-sm" : "bg-muted/30"
                        } rounded-full aspect-square w-11 h-11 ${
                          open ? "mr-5" : ""
                        } transition-all duration-300 ${
                          isActive ? "scale-105" : "hover:scale-105"
                        }`}
                      >
                        <Icon
                          className={`h-[22px] w-[22px] ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          } transition-colors duration-300`}
                        />
                      </div>
                      {open && (
                        <span
                          className={`font-medium text-base truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          } transition-colors duration-300`}
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
            className={`flex items-center justify-center h-12 w-12 rounded-full bg-background border border-border/20 shadow-md hover:shadow-lg hover:bg-muted/50 transition-all duration-300 ${
              open ? "-right-6" : "-right-6"
            } absolute`}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <ChevronLeftIcon
                size={18}
                className="text-primary transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <ChevronRightIcon
                size={18}
                className="text-primary transition-transform duration-300 group-hover:scale-110"
              />
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
    <div className="p-6 border-t border-border/20">
      <div className="flex items-center justify-center">
        <div
          className={`${
            open
              ? "flex items-center w-full"
              : "flex flex-col items-center w-full"
          }`}
        >
          <div className="group h-14 w-14 rounded-full bg-gradient-to-br from-background to-muted/30 flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-all duration-300 flex-shrink-0 border border-border/10 hover:border-primary/20 cursor-pointer">
            <div className="h-[52px] w-[52px] rounded-full bg-background flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/70 group-hover:from-primary/90 group-hover:to-primary transition-all duration-300">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          </div>
          {open && (
            <div className="ml-5 overflow-hidden">
              <p className="text-base font-medium truncate text-foreground">
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
        className={`mt-6 flex ${open ? "justify-between" : "justify-center"}`}
      >
        {open ? (
          <>
            <button
              onClick={handleLogout}
              className="group flex items-center justify-center gap-2.5 text-sm text-muted-foreground hover:text-foreground p-3 rounded-full hover:bg-muted/50 transition-all duration-300 hover:shadow-sm"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <LogOutIcon
                  size={16}
                  className="transition-all duration-300 group-hover:-translate-x-0.5"
                />
                <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-all duration-300"></div>
              </div>
              <span className="transition-all duration-300 group-hover:translate-x-0.5">
                Log out
              </span>
            </button>
            <ThemeToggle />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center justify-center text-sm text-muted-foreground hover:text-foreground p-3 rounded-full hover:bg-muted/50 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <LogOutIcon
                      size={16}
                      className="transition-all duration-300 group-hover:-translate-x-0.5"
                    />
                    <div className="absolute inset-0 bg-primary/10 rounded-full scale-0 group-hover:scale-100 transition-all duration-300"></div>
                  </div>
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
    <div className="flex h-screen w-full overflow-hidden bg-muted/20">
      <div className="relative hidden md:block">
        <Sidebar
          collapsible="icon"
          className={`border-r border-border/20 h-full transition-all duration-300 ease-in-out ${
            open ? "w-76" : "w-28"
          } bg-card/80 backdrop-blur-sm`}
        >
          <SidebarHeader className="flex items-center justify-between p-6 h-20 border-b border-border/20 bg-card/80 backdrop-blur-sm">
            {open ? (
              <h1 className="text-xl font-bold truncate text-foreground">
                ShelfWise
              </h1>
            ) : (
              <div className="w-full flex justify-center">
                <h1 className="text-xl font-bold text-foreground">S</h1>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent className="py-6 flex-1 overflow-y-auto bg-transparent">
            <Navigation />
          </SidebarContent>
          <SidebarFooter className="mt-auto bg-card/80 backdrop-blur-sm">
            <UserProfile />
          </SidebarFooter>
        </Sidebar>
        <SidebarToggleArrow />
      </div>
      <div className="flex-1 overflow-auto w-full flex flex-col">
        <div className="flex items-center justify-between p-5 h-20 border-b border-border/20 bg-card/80 backdrop-blur-sm">
          <h1 className="text-xl font-bold truncate text-foreground md:hidden">
            ShelfWise
          </h1>
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                className="pl-11 w-72 h-11 rounded-full bg-muted/50 border-none focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                placeholder="Search..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-11 w-11 bg-muted/50 hover:bg-muted/80 transition-all duration-300 hover:shadow-sm"
              >
                <BellIcon className="h-5 w-5 text-muted-foreground" />
              </Button>
              <ThemeToggle />
              <SidebarTrigger className="p-2 rounded-full hover:bg-muted/50 md:hidden transition-all duration-300">
                <MenuIcon size={20} />
              </SidebarTrigger>
            </div>
          </div>
        </div>
        <main className="p-5 md:p-6 pb-16 md:pb-24 w-full flex-1">
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
