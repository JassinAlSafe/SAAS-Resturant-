"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  ChevronDownIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarThemeToggle } from "../sidebar/components/SidebarThemeToggle";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBusinessProfile } from "@/lib/business-profile-context";
import Image from "next/image";
import { BookOpenIcon } from "lucide-react";
import { navItems } from "../sidebar/nav-items";
import { NavItem, hasChildren } from "../sidebar/types";
import { LogoutButton } from "@/components/ui/logout-button";

// Helpers
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

const useSidebarState = () => {
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({});

  // Update device type on resize
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < MOBILE_BREAKPOINT;
      const tablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Auto-collapse sidebar on tablet
      if (tablet) {
        setOpen(false);
      } else if (!mobile) {
        // On desktop, use saved preference
        const savedState = localStorage.getItem("sidebar_state");
        if (savedState) {
          setOpen(savedState === "true");
        } else {
          setOpen(true);
        }
      }

      // Close mobile sidebar when resizing
      if (mobile) {
        setOpenMobile(false);
      }
    };

    // Run on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save sidebar state when it changes
  React.useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar_state", String(open));
    }
  }, [open, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return {
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    isTablet,
    expandedSections,
    toggleSidebar,
    toggleSection,
  };
};

export function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    open,
    openMobile,
    isMobile,
    isTablet,
    expandedSections,
    toggleSidebar,
    toggleSection,
    setOpenMobile,
  } = useSidebarState();

  const { profile } = useBusinessProfile();
  const businessName = profile?.name || "Restaurant Manager";
  const logoUrl = profile?.logo || "";

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "fixed top-0 left-0 h-full z-40 transition-all duration-200 ease-in-out",
              "bg-white dark:bg-gray-950 border-r border-border",
              open ? "w-64" : "w-16"
            )}
            style={{ pointerEvents: "auto" }}
          >
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div
                className={cn(
                  "flex items-center gap-2",
                  !open && "justify-center w-full"
                )}
              >
                {!profile?.logo ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <BookOpenIcon className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-md overflow-hidden">
                    <Image
                      src={logoUrl}
                      alt={businessName}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {open && (
                  <span className="font-medium truncate">{businessName}</span>
                )}
              </div>

              {open && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-muted-foreground"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Navigation */}
            <div className="overflow-y-auto py-2 flex flex-col h-[calc(100vh-64px-60px)]">
              <NavItems
                items={navItems}
                isOpen={open}
                isMobile={isMobile}
                isTablet={isTablet}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            </div>

            {/* User Profile / Toggle */}
            <div className="border-t border-border mt-auto p-3">
              {!open ? (
                <div className="flex flex-col gap-3">
                  <SidebarThemeToggle />
                  <Button
                    variant="default"
                    size="default"
                    onClick={toggleSidebar}
                    className="mx-auto flex items-center justify-center bg-primary text-primary-foreground w-full"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRightIcon className="h-5 w-5 mr-1" />
                    <span className="text-xs">Expand</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {profile?.name
                            ? profile.name.charAt(0).toUpperCase()
                            : "U"}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {profile?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <SidebarThemeToggle />
                    <LogoutButton
                      variant="ghost"
                      size="icon"
                      text=""
                      className="text-muted-foreground"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Mobile Overlay */}
        {isMobile && openMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpenMobile(false)}
          />
        )}

        {/* Mobile Sidebar */}
        {isMobile && openMobile && (
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r border-border overflow-hidden">
            {/* Mobile Header */}
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                {!profile?.logo ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <BookOpenIcon className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-md overflow-hidden">
                    <Image
                      src={logoUrl}
                      alt={businessName}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <span className="font-medium truncate">{businessName}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMobile(false)}
                className="text-muted-foreground"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="overflow-y-auto py-2 h-[calc(100vh-128px)]">
              <NavItems
                items={navItems}
                isOpen={true}
                isMobile={true}
                isTablet={false}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            </div>

            {/* Mobile User Profile */}
            <div className="border-t border-border p-4">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <SidebarThemeToggle />
                <LogoutButton
                  variant="ghost"
                  size="icon"
                  text=""
                  className="text-muted-foreground"
                />
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 h-screen overflow-auto transition-all duration-200 ease-in-out",
            !isMobile && (open ? "ml-64" : "ml-16")
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-10 h-16 px-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-xs">
            {isMobile && (
              <div className="text-lg font-semibold truncate">
                {businessName}
              </div>
            )}
            <div className={cn("flex-1", !isMobile && "ml-3")}></div>
            <div className="flex items-center gap-2">
              <SidebarThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 md:p-6">{children}</div>
        </main>

        {/* Mobile Toggle Button */}
        {isMobile && !openMobile && (
          <Button
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
            size="icon"
            onClick={() => setOpenMobile(true)}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Collapsed Sidebar Toggle (Fixed Position) */}
        {!isMobile && !open && (
          <Button
            variant="default"
            size="default"
            onClick={toggleSidebar}
            className="fixed left-20 top-4 z-100 shadow-lg bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon className="h-5 w-5" />
            <span>Expand</span>
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}

// NavItems component to render navigation items
function NavItems({
  items,
  isOpen,
  isMobile,
  isTablet,
  expandedSections,
  toggleSection,
}: {
  items: NavItem[];
  isOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const pathname = usePathname();

  // Check if a nav item should appear active based on current URL
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Check if a nav section has any active children
  const isChildActive = (items: NavItem[]): boolean => {
    return items.some((item) => {
      if (hasChildren(item)) {
        return isChildActive(item.items);
      }
      return isActive(item.href);
    });
  };

  // Render a single nav item
  const renderNavItem = (item: NavItem): React.ReactNode => {
    // For items with children (sections)
    if (hasChildren(item)) {
      const active = isChildActive(item.items);
      const expanded = !expandedSections[item.name];

      // For collapsed sidebar
      if (!isOpen && !isMobile && !isTablet) {
        return (
          <Tooltip key={item.name} delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex h-9 w-9 mx-auto my-1 items-center justify-center rounded-md",
                  "hover:bg-accent/50 transition-colors",
                  active && "bg-accent/50 text-accent-foreground"
                )}
                onClick={() => toggleSection(item.name)}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.name}</TooltipContent>
          </Tooltip>
        );
      }

      // For expanded sidebar or mobile
      return (
        <div key={item.name} className="px-3 mb-1">
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5",
              "hover:bg-accent/50 transition-colors text-sm",
              active && "text-accent-foreground font-medium"
            )}
            onClick={() => toggleSection(item.name)}
          >
            <div className="flex items-center">
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-2 h-4 w-4",
                    active && "text-accent-foreground"
                  )}
                />
              )}
              <span>{item.name}</span>
            </div>
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform",
                expanded ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>

          {expanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
              {item.items.map((subItem) => renderNavItem(subItem))}
            </div>
          )}
        </div>
      );
    }

    // For regular items (links)
    const active = isActive(item.href);

    // For collapsed sidebar
    if (!isOpen && !isMobile && !isTablet) {
      return (
        <Tooltip key={item.name} delayDuration={100}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex h-9 w-9 mx-auto my-1 items-center justify-center rounded-md",
                "hover:bg-accent/50 transition-colors",
                active && "bg-accent/50 text-accent-foreground"
              )}
            >
              {item.icon ? (
                <item.icon className="h-5 w-5" />
              ) : (
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    // For expanded sidebar or mobile
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center px-2 py-1.5 mx-3 rounded-md text-sm",
          "hover:bg-accent/50 transition-colors",
          active && "bg-accent/50 text-accent-foreground font-medium",
          !item.icon && "ml-6" // Indent child items with no icons
        )}
      >
        {item.icon ? (
          <item.icon
            className={cn("mr-2 h-4 w-4", active && "text-accent-foreground")}
          />
        ) : (
          <div
            className={cn(
              "mr-2 h-1.5 w-1.5 rounded-full",
              active ? "bg-primary" : "bg-muted-foreground/30"
            )}
          />
        )}
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="space-y-1 px-2">
      {items.map((item) => renderNavItem(item))}
    </div>
  );
}
