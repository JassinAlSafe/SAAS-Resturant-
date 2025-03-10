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
        "flex items-center border-b border-gray-200 dark:border-gray-800",
        open ? "px-4 py-5" : "px-0 py-5"
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-3 transition-all duration-200 hover:opacity-80",
          !open && "justify-center w-full"
        )}
      >
        {!logoUrl ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-md bg-teal-500/10 text-teal-500 shadow-sm",
              open ? "h-8 w-8" : "h-8 w-8"
            )}
          >
            <BookOpenIcon className="h-5 w-5" />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm",
              open ? "h-8 w-8" : "h-8 w-8"
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
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {businessName}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
