"use client";

import React from "react";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  Copy, 
  Archive, 
  RotateCcw 
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
      <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-square">
        <MoreHorizontal className="h-4 w-4" />
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li className="menu-title">Actions</li>
        {onEdit && (
          <li>
            <button onClick={onEdit} className="flex items-center">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </li>
        )}
        {onDuplicate && (
          <li>
            <button onClick={onDuplicate} className="flex items-center">
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
          </li>
        )}
        {onArchive && (
          <li>
            <button onClick={onArchive} className="flex items-center">
              {isArchived ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Archive
                </>
              )}
            </button>
          </li>
        )}
        {onDelete && (
          <>
            <li className="divider"></li>
            <li>
              <button onClick={onDelete} className="text-error">
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
