import React from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExportFormat = "csv" | "excel" | "pdf" | "json" | "text";

export interface ExportOption {
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
}

export interface AdvancedExportButtonProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  formats?: ExportFormat[];
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isLoading?: boolean;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "primary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
}

const DEFAULT_EXPORT_OPTIONS: Record<ExportFormat, ExportOption> = {
  csv: {
    format: "csv",
    label: "CSV",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
  excel: {
    format: "excel",
    label: "Excel",
    icon: <FileSpreadsheet className="h-4 w-4 mr-2" />,
  },
  pdf: {
    format: "pdf",
    label: "PDF",
    icon: <File className="h-4 w-4 mr-2" />,
  },
  json: {
    format: "json",
    label: "JSON",
    icon: <FileJson className="h-4 w-4 mr-2" />,
  },
  text: {
    format: "text",
    label: "Text",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
};

export function AdvancedExportButton({
  onExport,
  formats = ["csv", "excel", "pdf", "json"],
  label = "Export",
  size = "sm",
  className = "",
  isLoading = false,
  buttonVariant = "ghost",
}: AdvancedExportButtonProps) {
  const buttonSizeStyles = {
    sm: "h-8",
    md: "h-9",
    lg: "h-10",
  };

  const defaultStyles = "hover:bg-secondary/80 text-foreground";

  const availableOptions = formats.map(
    (format) => DEFAULT_EXPORT_OPTIONS[format]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size={size}
          className={`${buttonSizeStyles[size]} ${defaultStyles} ${className}`}
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          {label}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50">
        {availableOptions.map((option) => (
          <DropdownMenuItem
            key={option.format}
            onClick={() => onExport(option.format)}
            className="cursor-pointer text-gray-800 hover:bg-slate-100 rounded-sm"
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
