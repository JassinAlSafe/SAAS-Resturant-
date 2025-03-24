"use client";

import * as React from "react";
import { MenuIcon, SearchIcon, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
import { UserData } from "@/hooks/use-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
  user,
}: AppHeaderProps) {
  const [notificationCount] = React.useState(3);

  return (
    <header className="sticky top-0 z-10 h-16 px-4 border-b border-gray-200 flex items-center justify-between bg-background/80 backdrop-blur-xs">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenMobile(!openMobile)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Open Menu
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 relative"
              >
                <BellIcon className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Notifications
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center justify-center">
          <SidebarThemeToggle />
        </div>

        {/* User greeting - only visible on larger screens */}
        <div className="hidden md:block">
          <p className="text-sm font-medium">
            Welcome,{" "}
            <span className="text-primary">
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </p>
        </div>
      </div>
    </header>
  );
}
