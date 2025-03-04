"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./components/SidebarHeader";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { SidebarUserProfile } from "./components/SidebarUserProfile";
import { SidebarCollapseButton } from "./components/SidebarCollapseButton";
import { MobileSidebar } from "./components/MobileSidebar";
import { MenuIcon, SearchIcon, BellIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { useAuth } from "@/lib/auth-context";
import { useMediaQueries } from "@/hooks/use-media-query";
import { navItems } from "./nav-items"; // Import navItems directly

// Custom hook for sidebar state management
const useSidebarState = () => {
  // Initialize state from localStorage if available, otherwise default to true (open)
  const [open, setOpen] = React.useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar_state");
      return savedState !== null ? savedState === "true" : true;
    }
    return true;
  });

  // Toggle sidebar open/closed
  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => {
      const newState = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_state", String(newState));
      }
      return newState;
    });
  }, []);

  return {
    open,
    setOpen,
    toggleSidebar,
  };
};

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { open, toggleSidebar } = useSidebarState();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});
  const { isMobile } = useMediaQueries();
  const { profile } = useBusinessProfile();
  const { signOut } = useAuth();

  const businessName = profile?.name || "Restaurant Manager";
  const logoUrl = profile?.logo || "";
  const userEmail = "user@example.com"; // Placeholder since user is not available in context

  // User object
  const user = {
    name: "User",
    email: userEmail,
    image: "",
  };

  // Navigation items (using the imported navItems)
  // const navItems = getNavItems();

  // Toggle a section expanded/collapsed
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle logout
  const handleLogout = () => {
    try {
      signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed top-0 left-0 h-full z-40 transition-all duration-200 ease-in-out",
            "bg-card dark:bg-gray-950 border-r border-border/40 shadow-sm",
            open ? "w-64" : "w-16"
          )}
          style={{ pointerEvents: "auto" }}
        >
          <div className="relative flex h-full flex-col">
            {/* Header */}
            <SidebarHeader
              open={open}
              businessName={businessName}
              logoUrl={logoUrl}
            />

            {/* Collapse Button */}
            <div className="relative h-0 w-full">
              <SidebarCollapseButton
                open={open}
                toggleSidebar={toggleSidebar}
              />
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
              <SidebarNavigation
                open={open}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                navItems={navItems}
              />
            </div>

            {/* User Profile */}
            <SidebarUserProfile
              open={open}
              user={user}
              handleLogout={handleLogout}
            />
          </div>
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <>
          {/* Mobile Menu Button */}
          <div className="fixed top-4 left-4 z-40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(!openMobile)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Sidebar Component */}
          <MobileSidebar
            openMobile={openMobile}
            setOpenMobile={setOpenMobile}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            navItems={navItems}
            businessName={businessName}
            logoUrl={logoUrl}
            handleLogout={handleLogout}
          />
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden transition-all duration-200 ease-in-out",
          !isMobile && (open ? "ml-64" : "ml-16")
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 px-4 border-b border-border/40 flex items-center justify-between bg-background/80 backdrop-blur-sm">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMobile(!openMobile)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MenuIcon className="h-4 w-4" />
              </Button>
            )}
            <div className="relative w-64 lg:w-72 hidden md:block">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 bg-background w-full rounded-lg border-muted h-9"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            </Button>

            <div className="flex items-center gap-3 pl-2 border-l border-border/40">
              <Avatar className="h-9 w-9 rounded-full">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary rounded-full">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">user</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Make it scrollable */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
