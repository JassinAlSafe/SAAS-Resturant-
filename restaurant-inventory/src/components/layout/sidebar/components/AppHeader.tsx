"use client";

import * as React from "react";
import { MenuIcon, SearchIcon, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
import { UserData } from "@/hooks/use-user";

interface AppHeaderProps {
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  user: UserData;
}

export function AppHeader({
  isMobile,
  openMobile,
  setOpenMobile,
}: AppHeaderProps) {
  return (
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
        <SidebarThemeToggle />

      </div>
    </header>
  );
}
