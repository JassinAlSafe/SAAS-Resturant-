"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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
        "flex items-center border-b border-gray-200",
        open ? "px-5 py-4" : "px-0 py-4"
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-3 transition-all duration-200 hover:opacity-90",
          !open && "justify-center w-full"
        )}
      >
        {!logoUrl ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm",
              open ? "h-10 w-10" : "h-10 w-10"
            )}
          >
            <BookOpenIcon className="h-5 w-5" />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg overflow-hidden border border-gray-200 shadow-sm",
              open ? "h-10 w-10" : "h-10 w-10"
            )}
          >
            <Image
              src={logoUrl}
              alt={`${businessName} logo`}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {open && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">{businessName}</span>
            <span className="text-xs text-gray-500 mt-0.5">Restaurant Manager</span>
          </div>
        )}
      </Link>
    </div>
  );
}
