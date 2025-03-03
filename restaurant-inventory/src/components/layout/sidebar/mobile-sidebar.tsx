"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar-header";
import { Navigation } from "./navigation";
import { UserProfile } from "./user-profile";
import { HeaderSearch } from "./header-search";

export function MobileSidebar() {
  const { openMobile, toggleMobile, setMobileOpen } = useSidebarStore();
  const openNav = () => setMobileOpen(true);
  const closeNav = () => setMobileOpen(false);

  // Touch gesture handling
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && openMobile) {
      closeNav();
    }
  };

  // Close sidebar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        openMobile
      ) {
        closeNav();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMobile, closeNav]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openNav}
        className="md:hidden h-8 w-8 hover:bg-accent/30 transition-colors"
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all md:hidden",
          openMobile ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeNav}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[80%] max-w-[280px] bg-background border-r md:hidden",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col shadow-md",
          openMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <SidebarHeader />
            <Button
              variant="ghost"
              size="icon"
              onClick={closeNav}
              className="h-7 w-7 rounded-full hover:bg-accent/30"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <HeaderSearch />
          <div className="flex-1 px-2 py-2 overflow-y-auto scrollbar-thin">
            <Navigation />
          </div>
          <UserProfile />

          {/* Swipe indicator - simplified */}
          <div className="p-1.5 text-center border-t">
            <span className="inline-block w-8 h-0.5 bg-muted-foreground/20 rounded-full"></span>
          </div>
        </div>
      </div>
    </>
  );
}
