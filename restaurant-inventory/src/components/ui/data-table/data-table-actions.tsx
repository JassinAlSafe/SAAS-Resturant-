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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableActionsProps<T> {
  item: T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  onArchive?: (item: T) => Promise<void>;
  isArchived?: boolean;
  actionLabels?: {
    edit?: string;
    delete?: string;
    duplicate?: string;
    archive?: string;
    restore?: string;
  };
}

export function DataTableActions<T>({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  isArchived = false,
  actionLabels = {
    edit: "Edit",
    delete: "Delete",
    duplicate: "Duplicate",
    archive: "Archive",
    restore: "Restore"
  }
}: DataTableActionsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            {actionLabels.edit}
          </DropdownMenuItem>
        )}
        {onDuplicate && (
          <DropdownMenuItem onClick={() => onDuplicate(item)}>
            <Copy className="mr-2 h-4 w-4" />
            {actionLabels.duplicate}
          </DropdownMenuItem>
        )}
        {onArchive && (
          <DropdownMenuItem 
            onClick={() => onArchive(item)}
          >
            {isArchived ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                {actionLabels.restore}
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                {actionLabels.archive}
              </>
            )}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(item)}
            >
              <Trash className="mr-2 h-4 w-4" />
              {actionLabels.delete}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
