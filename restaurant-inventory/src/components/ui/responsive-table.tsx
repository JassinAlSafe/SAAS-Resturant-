import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: { key: string; label: string }[];
  data: any[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: string;
  cellClassName?: string;
  headerClassName?: string;
  renderCustomCell?: (
    item: any,
    column: { key: string; label: string }
  ) => React.ReactNode;
}

export function ResponsiveTable({
  headers,
  data,
  isLoading = false,
  emptyMessage = "No data available",
  className,
  rowClassName,
  cellClassName,
  headerClassName,
  renderCustomCell,
  ...props
}: ResponsiveTableProps) {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="w-full text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full responsive-table", className)} {...props}>
        <thead className={cn("bg-muted/50", headerClassName)}>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  "hidden sm:table-cell" // Hide on mobile, show on larger screens
                )}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "hover:bg-muted/50 transition-colors",
                rowClassName
              )}
            >
              {headers.map((header, colIndex) => (
                <td
                  key={`${rowIndex}-${header.key}`}
                  className={cn(
                    "px-4 py-3",
                    colIndex === 0 ? "" : "hidden sm:table-cell", // Show only first column on mobile
                    cellClassName
                  )}
                  data-label={header.label}
                >
                  {renderCustomCell ? (
                    renderCustomCell(item, header)
                  ) : (
                    <span className="text-sm">{item[header.key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card view (only displayed on small screens) */}
      <div className="sm:hidden space-y-3 mt-2">
        {data.map((item, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-card border rounded-lg p-3 shadow-xs hover:shadow-md transition-shadow"
          >
            {headers.map((header) => (
              <div
                key={`mobile-${rowIndex}-${header.key}`}
                className="flex justify-between py-1.5 border-b last:border-none"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {header.label}
                </span>
                <span className="text-sm text-right font-medium">
                  {renderCustomCell
                    ? renderCustomCell(item, header)
                    : item[header.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
