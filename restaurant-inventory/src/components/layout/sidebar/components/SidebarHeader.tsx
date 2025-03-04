"use client";

import * as React from "react";
import Image from "next/image";
import { BookOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  open: boolean;
  businessName: string;
  logoUrl: string;
}

export function SidebarHeader({
  open,
  businessName,
  logoUrl,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/40",
        open ? "px-4 py-4" : "px-0 py-4"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          !open && "justify-center w-full"
        )}
      >
        {!logoUrl ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-md bg-primary/10 text-primary",
              open ? "h-8 w-8" : "h-10 w-10"
            )}
          >
            <BookOpenIcon className="h-4 w-4" />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-md overflow-hidden",
              open ? "h-8 w-8" : "h-10 w-10"
            )}
          >
            <Image
              src={logoUrl}
              alt={businessName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {open && (
          <span className="font-medium truncate text-sm">{businessName}</span>
        )}
      </div>
    </div>
  );
}
