"use client";

import * as React from "react";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  return (
    <div className="mt-auto border-t border-gray-200">
      {/* User Profile Section */}
      {open ? (
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                {user.name?.[0]?.toUpperCase() || 'U'}
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
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50/80",
              "transition-colors rounded-md py-2 px-3"
            )}
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-full p-0 hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8 border border-gray-200 shadow-sm">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" sideOffset={5}>
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8 border border-gray-200 shadow-sm">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
