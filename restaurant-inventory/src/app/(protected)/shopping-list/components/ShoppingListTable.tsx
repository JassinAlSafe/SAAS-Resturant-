"use client";

import { useState } from "react";
import { ShoppingListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, Loader2, Trash, Clock, ChevronDown } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

interface ShoppingListTableProps {
  items: ShoppingListItem[];
  onEditItem: (item: ShoppingListItem) => void;
  onDeleteItem: (id: string) => Promise<void>;
  onTogglePurchased: (id: string, isPurchased: boolean) => Promise<void>;
  isDeleting: boolean;
  isUpdating: boolean;
  onAddItem: () => void;
}

export default function ShoppingListTable({
  items,
  onEditItem,
  onDeleteItem,
  onTogglePurchased,
  isDeleting,
  isUpdating,
  onAddItem,
}: ShoppingListTableProps) {
  const { formatCurrency } = useCurrency();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Define columns for the table
  const columns: ColumnDef<ShoppingListItem>[] = [
    {
      id: "status",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center">
            <div className="relative">
              <div
                className={cn(
                  "h-5 w-5 border-2 rounded-md flex items-center justify-center transition-colors",
                  item.isPurchased
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-blue-300 bg-transparent"
                )}
              >
                {item.isPurchased && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <input
                  type="checkbox"
                  checked={item.isPurchased}
                  onChange={() => onTogglePurchased(item.id, !item.isPurchased)}
                  disabled={isUpdating}
                  className="sr-only"
                  aria-label={`Mark ${item.name} as ${
                    item.isPurchased ? "not purchased" : "purchased"
                  }`}
                />
              </div>
              {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col py-1">
            <span
              className={cn(
                "text-sm font-medium",
                item.isUrgent &&
                  !item.isPurchased &&
                  "text-red-600 font-semibold",
                item.isPurchased && "text-muted-foreground line-through"
              )}
            >
              {item.name}
              {item.isUrgent && !item.isPurchased && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                  Urgent
                </span>
              )}
            </span>
            {item.addedAt && (
              <div className="text-xs text-muted-foreground mt-1">
                • Added {format(new Date(item.addedAt), "MMM d, yyyy")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-left">Quantity</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-sm">
            <span className="tabular-nums font-medium">{item.quantity}</span>
            {item.unit && (
              <span className="ml-1 text-slate-500">{item.unit}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => <div className="text-left">Category</div>,
      cell: ({ row }) => {
        const categoryColorMap: Record<string, string> = {
          Pantry: "bg-amber-50 text-amber-700",
          Dairy: "bg-blue-50 text-blue-700",
          Produce: "bg-green-50 text-green-700",
          Meat: "bg-red-50 text-red-700",
          Bakery: "bg-yellow-50 text-yellow-700",
          Seafood: "bg-cyan-50 text-cyan-700",
          Other: "bg-purple-50 text-purple-700",
        };

        const category = row.original.category;
        const colorClass =
          categoryColorMap[category] || "bg-slate-50 text-slate-700";

        return (
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                colorClass
              )}
            >
              {category || "Uncategorized"}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "estimatedCost",
      header: () => <div className="text-right">Est. Cost</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right tabular-nums text-sm font-medium">
            {formatCurrency(row.original.estimatedCost || 0)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditItem(item)}
              disabled={isDeleting || isUpdating}
              className="h-8 w-8 rounded-md p-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteItem(item.id)}
              disabled={isDeleting || isUpdating}
              className="h-8 w-8 rounded-md p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  // Initialize the table
  const table = useReactTable({
    data: items,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (items.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
          <Clock className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-base font-medium text-slate-700">
          No items found
        </h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          Your shopping list is empty. Add items manually or generate a list
          from your inventory.
        </p>
        <Button
          onClick={onAddItem}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-10 px-4 py-2 text-sm font-medium text-slate-600 first:pl-6 first:w-[50px] last:w-[90px]"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b last:border-0",
                      "hover:bg-slate-50/70",
                      row.original.isPurchased && "bg-slate-50/40",
                      row.original.isUrgent &&
                        !row.original.isPurchased &&
                        "bg-red-50/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 h-16",
                          cell.column.id === "status" && "w-[50px] pl-6",
                          cell.column.id === "actions" && "w-[90px]"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 py-2">
        <div className="text-xs text-slate-500">
          {table.getFilteredRowModel().rows.length} of {items.length} items
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-normal border-slate-200 text-slate-700"
              >
                Columns <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 rounded-l-md border-r-0 px-3 text-xs border-slate-200"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 rounded-r-md px-3 text-xs border-slate-200"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
