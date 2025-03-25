"use client";

import React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeaderProps {
  label: string;
  field: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  className?: string;
}

export function TableHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
  className,
}: TableHeaderProps) {
  const isActive = sortField === field;

  return (
    <th 
      className={cn(
        "text-left cursor-pointer",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1 group">
        {label}
        <span
          className={cn(
            "transition-colors",
            isActive
              ? "text-gray-700"
              : "text-gray-300 group-hover:text-gray-400"
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
    </th>
  );
}
