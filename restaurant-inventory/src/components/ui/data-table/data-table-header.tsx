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
}

export function DataTableHeader({
  label,
  field,
  sortable,
  sortField,
  sortDirection,
  handleSort,
}: DataTableHeaderProps) {
  const isActive = sortField === field;

  if (!sortable) {
    return <span>{label}</span>;
  }

  return (
    <div
      className="flex items-center gap-1 cursor-pointer group"
      onClick={() => handleSort(field)}
    >
      {label}
      <span
        className={cn(
          "transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground/0 group-hover:text-muted-foreground/50"
        )}
      >
        {isActive ? (
          sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </span>
    </div>
  );
}
