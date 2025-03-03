"use client";

import * as React from "react";
import { SidebarHeader } from "./sidebar-header";
import { Navigation } from "./navigation";
import { UserProfile } from "./user-profile";
import { HeaderSearch } from "./header-search";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";

export function DesktopSidebar() {
  const { isOpen } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden h-screen border-r bg-background flex-col shadow-sm md:flex",
        "transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <SidebarHeader />
      <HeaderSearch />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Navigation />
      </div>
      <UserProfile />
    </aside>
  );
}
