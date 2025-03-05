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
        "flex items-center justify-between border-b border-border/40",
        open ? "px-4 py-4" : "px-0 py-4"
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
              "flex items-center justify-center rounded-md bg-primary/10 text-primary shadow-sm",
              open ? "h-10 w-10" : "h-10 w-10"
            )}
          >
            <BookOpenIcon className="h-5 w-5" />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-md overflow-hidden border border-border/40 shadow-sm",
              open ? "h-10 w-10" : "h-10 w-10"
            )}
          >
            <Image
              src={logoUrl}
              alt={businessName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {open && (
          <div className="flex flex-col">
            <span className="font-semibold truncate text-sm">
              {businessName}
            </span>
            <span className="text-xs text-muted-foreground">
              Inventory System
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
