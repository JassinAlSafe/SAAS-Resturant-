"use client";

import React from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Copy,
  Archive,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
  className?: string;
}

export function DataTableActions({
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  isArchived = false,
  className,
}: DataTableActionsProps) {
  return (
    <div className={cn("dropdown dropdown-end", className)}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-xs btn-square text-neutral-500 hover:bg-neutral-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-white border border-neutral-100 rounded-lg w-52"
      >
        <li className="menu-title text-neutral-500 font-medium text-xs uppercase tracking-wider px-2 py-1.5">
          Actions
        </li>
        {onEdit && (
          <li>
            <button
              onClick={onEdit}
              className="flex items-center text-neutral-700 hover:bg-neutral-50 rounded-md"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
              Edit
            </button>
          </li>
        )}
        {onDuplicate && (
          <li>
            <button
              onClick={onDuplicate}
              className="flex items-center text-neutral-700 hover:bg-neutral-50 rounded-md"
            >
              <Copy className="h-4 w-4 text-neutral-500" />
              Duplicate
            </button>
          </li>
        )}
        {onArchive && (
          <li>
            <button
              onClick={onArchive}
              className="flex items-center text-neutral-700 hover:bg-neutral-50 rounded-md"
            >
              {isArchived ? (
                <>
                  <RotateCcw className="h-4 w-4 text-green-500" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 text-amber-500" />
                  Archive
                </>
              )}
            </button>
          </li>
        )}
        {onDelete && (
          <>
            <li className="divider my-1 h-px bg-neutral-100"></li>
            <li>
              <button
                onClick={onDelete}
                className="text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash className="h-4 w-4" />
                Delete
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
