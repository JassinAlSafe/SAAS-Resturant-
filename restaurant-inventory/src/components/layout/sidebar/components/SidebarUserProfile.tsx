"use client";

import * as React from "react";
import Image from "next/image";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarUserProfileProps {
  open: boolean;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  handleLogout: () => void;
}

export function SidebarUserProfile({
  open,
  user,
  handleLogout,
}: SidebarUserProfileProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-t border-border/40",
        open ? "px-4" : "px-2"
      )}
    >
      {open ? (
        <>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="right">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
