"use client";

import React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeaderProps {
  label: string;
  field: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
}

export function TableHeader({
  label,
  field,
  sortField,
  sortDirection,
  handleSort,
}: TableHeaderProps) {
  const isActive = sortField === field;

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
            ? "text-base-content"
            : "text-base-content/0 group-hover:text-base-content/50"
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
