"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileSpreadsheet, FileText, FileType } from "lucide-react";

interface ExportButtonProps {
  onExport: (format: "csv" | "excel" | "pdf") => void;
  label?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  showSelectedItems?: boolean;
  selectedCount?: number;
}

export function ExportButton({
  onExport,
  label = "Export",
  variant = "outline",
  disabled = false,
  showSelectedItems = false,
  selectedCount = 0,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="default"
          className="flex items-center gap-2"
          disabled={disabled}
        >
          <FileDown className="h-4 w-4" />
          {label}
          {showSelectedItems && selectedCount > 0 && (
            <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {selectedCount} selected
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="flex items-center cursor-pointer"
          onClick={() => handleExport("excel")}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center cursor-pointer"
          onClick={() => handleExport("csv")}
        >
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center cursor-pointer"
          onClick={() => handleExport("pdf")}
        >
          <FileType className="mr-2 h-4 w-4 text-red-600" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
