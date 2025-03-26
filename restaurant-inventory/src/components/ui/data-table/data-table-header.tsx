"use client";

import React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableHeaderProps {
  label: string;
  field: string;
  sortable: boolean;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  className?: string;
}

export function DataTableHeader({
  label,
  field,
  sortable,
  sortField,
  sortDirection,
  handleSort,
  className,
}: DataTableHeaderProps) {
  const isActive = sortField === field;

  if (!sortable) {
    return <span className={className}>{label}</span>;
  }

  return (
    <div
      className={cn("flex items-center gap-1 cursor-pointer group", className)}
      onClick={() => handleSort(field)}
    >
      {label}
      <span
        className={cn(
          "transition-colors",
          isActive
            ? "text-orange-500"
            : "text-neutral-300 group-hover:text-neutral-400"
        )}
      >
        {isActive ? (
          sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </span>
    </div>
  );
}
