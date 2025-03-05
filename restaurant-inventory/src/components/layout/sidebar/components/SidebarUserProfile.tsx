"use client";

import * as React from "react";
import {
  LogOutIcon,
  UserIcon,
  Settings2Icon,
  ChevronUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
    role?: string;
  };
  handleLogout: () => void;
}

export function SidebarUserProfile({
  open,
  user,
  handleLogout,
}: SidebarUserProfileProps) {
  const [showFullProfile, setShowFullProfile] = React.useState(false);

  return (
    <div className="mt-auto border-t border-border/40">
      {/* User Profile Section */}
      {open ? (
        <div className="p-4">
          <div className="w-full rounded-lg bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/10">
                <AvatarImage src={user?.image} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>

            {showFullProfile && (
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {}}
                  >
                    <UserIcon className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {}}
                  >
                    <Settings2Icon className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-muted-foreground"
              onClick={() => setShowFullProfile(!showFullProfile)}
            >
              <ChevronUpIcon
                className={cn("h-3 w-3 mr-1 transition-transform", {
                  "transform rotate-180": !showFullProfile,
                })}
              />
              {showFullProfile ? "Show Less" : "Show More"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarImage src={user?.image} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings2Icon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
