"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  BellIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";

export function UserProfile() {
  const router = useRouter();
  const { isOpen } = useSidebarStore();
  const [user] = React.useState({
    name: "Jassin",
    email: "jassinalsafe90@gmail.com",
    image: null,
    role: "Admin",
  });
  const [isOnline, setIsOnline] = React.useState(true);

  const handleLogout = async () => {
    try {
      // In a real app, you would call your auth service to log out
      console.log("Logging out...");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    console.log(`You are now ${!isOnline ? "online" : "in away status"}`);
  };

  return (
    <div className="mt-auto border-t p-4">
      <div className="w-full">
        <Button
          variant="ghost"
          className="relative w-full justify-start px-2 hover:bg-accent"
          onClick={handleSettings}
        >
          <div className="flex w-full items-center gap-2">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                  isOnline ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
            </div>
            {isOpen && (
              <div className="flex flex-1 flex-col items-start text-left">
                <p className="text-sm font-medium">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-sm border px-1 py-0 text-[10px] font-normal">
                    {user.role}
                  </span>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            {isOpen && <ChevronsUpDownIcon className="h-4 w-4 opacity-70" />}
          </div>
        </Button>

        {isOpen && (
          <div className="flex mt-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={toggleOnlineStatus}
            >
              <span className="text-xs">{isOnline ? "Online" : "Away"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleSettings}
            >
              <SettingsIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
