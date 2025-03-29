"use client";

import * as React from "react";
import { LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarUserProfileProps {
  open: boolean;
  user: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  handleLogout: () => void;
}

export function SidebarUserProfile({
  open,
  user,
  handleLogout,
}: SidebarUserProfileProps) {
  // Mock notification data - in a real app, this would come from a notifications service
  const notifications = { count: 1 };
  const hasNotifications = notifications.count > 0;

  return (
    <div className="mt-auto">
      {/* User Profile Section */}
      {open ? (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium leading-none text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate mt-1.5">
                {user.email}
              </p>
            </div>
          </div>
          <button
            className={cn(
              "w-full flex items-center justify-start text-gray-700 hover:text-red-600 hover:bg-red-50/80",
              "transition-colors rounded-md py-2 px-3 text-sm font-medium"
            )}
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center p-0 mt-auto">
          {/* Avatar with notification badge */}
          <div className="relative mb-1 mt-2">
            <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {/* Notification indicator */}
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[11px] text-white font-medium">
                {notifications.count}
              </span>
            )}
          </div>
          
          {/* User name */}
          <p className="text-sm font-medium text-gray-900 mb-4">{user.name}</p>
          
          {/* Sign Out button as just an icon */}
          <button
            className="text-red-600 hover:text-red-700 mb-3"
            onClick={handleLogout}
            aria-label="Sign Out"
          >
            <LogOutIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
