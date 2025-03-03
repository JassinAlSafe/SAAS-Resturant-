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
import { MobileContent } from "./mobile-content";

export function MobileSidebar() {
  const { openMobile, setOpenMobile } = useSidebarStore();
  const openNav = () => setOpenMobile(true);
  const closeNav = () => setOpenMobile(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openNav}
        className="md:hidden h-9 w-9 hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all md:hidden",
          openMobile ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeNav}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-3/4 max-w-xs bg-background border-r md:hidden transform transition-transform duration-300 ease-in-out",
          openMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <SidebarHeader />
            <Button
              variant="ghost"
              size="icon"
              onClick={closeNav}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <HeaderSearch />
          <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
            <Navigation />
          </div>
          <UserProfile />
        </div>
      </div>

      <MobileContent />
    </>
  );
}
