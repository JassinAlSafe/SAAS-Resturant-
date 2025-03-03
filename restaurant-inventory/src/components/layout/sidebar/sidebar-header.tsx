"use client";

import * as React from "react";
import { BookOpenIcon } from "lucide-react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import useSafeMediaQueries from "@/hooks/use-media-query";
import { useBusinessProfile } from "@/lib/business-profile-context";
import Image from "next/image";

export function SidebarHeader() {
  const { isOpen } = useSidebarStore();
  const { isMobile, isTablet } = useSafeMediaQueries();
  const { profile, isLoading } = useBusinessProfile();

  // Don't depend on the profile during initial load to prevent flickering
  const logoUrl = profile?.logo || "";
  const businessName = profile?.name || "Restaurant Manager";

  return (
    <div
      className={cn(
        "flex items-center p-3",
        !isOpen && !isMobile && !isTablet && "justify-center"
      )}
    >
      <div className="flex items-center gap-2">
        {!isLoading && logoUrl ? (
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
            <Image
              src={logoUrl}
              alt={businessName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/90 text-white">
            <BookOpenIcon className="h-4 w-4" />
          </div>
        )}
        {(isOpen || isMobile || isTablet) && (
          <span className="font-medium text-foreground">{businessName}</span>
        )}
      </div>
    </div>
  );
}
