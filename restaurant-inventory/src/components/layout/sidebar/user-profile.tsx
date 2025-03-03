"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { SidebarContextType } from "./types";

export function UserProfile({
  sidebarContext,
}: {
  sidebarContext: SidebarContextType;
}) {
  const { open } = sidebarContext;
  const { profile } = useAuth();

  return (
    <div className="user-profile px-4 py-4">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 shadow-sm flex-shrink-0">
          <span className="text-sm font-semibold">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
          </span>
        </div>
        {open && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium truncate text-gray-900">
              {profile?.name || "Sebastian Ekstrand"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email || "Region West, CU Frontend 2"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
