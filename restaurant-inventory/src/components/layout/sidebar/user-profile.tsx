"use client";

import * as React from "react";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import useSafeMediaQueries from "@/hooks/use-media-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserProfile() {
  const { isOpen } = useSidebarStore();
  const { isMobile, isTablet } = useSafeMediaQueries();

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    name: "John Doe",
    role: "Restaurant Manager",
    image: null, // URL to user's profile image
  };

  return (
    <div className="border-t p-2">
      <div
        className={cn(
          "flex items-center w-full rounded-md p-1.5",
          !isOpen && !isMobile && !isTablet && "justify-center"
        )}
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={user.image || ""} alt={user.name} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        {(isOpen || isMobile || isTablet) && (
          <div className="ml-2 flex-1 overflow-hidden text-left">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground/70">
              {user.role}
            </p>
          </div>
        )}

        {(isOpen || isMobile || isTablet) && (
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-6 w-6 text-muted-foreground/60"
            >
              <Link href="/profile">
                <User className="h-3.5 w-3.5" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-6 w-6 text-muted-foreground/60"
            >
              <Link href="/settings">
                <Settings className="h-3.5 w-3.5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
