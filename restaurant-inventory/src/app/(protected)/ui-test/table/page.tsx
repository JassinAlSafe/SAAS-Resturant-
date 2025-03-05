"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiCheck, FiTrash2, FiShoppingCart } from "react-icons/fi";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";

interface TestItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  source: "manual" | "auto";
  isPurchased: boolean;
}

export default function TableTestPage() {
  // Sample data
  const [items, setItems] = useState<TestItem[]>([
    {
      id: "1",
      name: "Olive Oil",
      category: "Pantry",
      quantity: 3,
      unit: "L",
      cost: 45.99,
      source: "manual",
      isPurchased: false,
    },
    {
      id: "2",
      name: "Chicken Breast",
      category: "Meat",
      quantity: 5,
      unit: "kg",
      cost: 65.5,
      source: "auto",
      isPurchased: false,
    },
    {
      id: "3",
      name: "Tomatoes",
      category: "Produce",
      quantity: 2,
      unit: "kg",
      cost: 12.75,
      source: "manual",
      isPurchased: true,
    },
    {
      id: "4",
      name: "Milk",
      category: "Dairy",
      quantity: 10,
      unit: "L",
      cost: 35.0,
      source: "auto",
      isPurchased: false,
    },
    {
      id: "5",
      name: "Flour",
      category: "Baking",
      quantity: 5,
      unit: "kg",
      cost: 18.25,
      source: "manual",
      isPurchased: false,
    },
  ]);

  // State for bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Handle select all
  const handleSelectAll = () => {
    if (
      selectedItems.size === items.filter((item) => !item.isPurchased).length
    ) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(
          items.filter((item) => !item.isPurchased).map((item) => item.id)
        )
      );
    }
  };

  // Handle select item
  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle mark as purchased
  const handleMarkAsPurchased = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, isPurchased: true } : item
      )
    );

    // Remove from selected items
    const newSelected = new Set(selectedItems);
    newSelected.delete(itemId);
    setSelectedItems(newSelected);
  };

  // Handle bulk mark as purchased
  const handleBulkMarkAsPurchased = () => {
    setItems(
      items.map((item) =>
        selectedItems.has(item.id) ? { ...item, isPurchased: true } : item
      )
    );
    setSelectedItems(new Set());
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Table Component Test
      </h1>

      <div className="space-y-6">
        {/* Default Table */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Default Table
          </h2>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{formatCurrency(item.cost)}</TableCell>
                    <TableCell>
                      {item.isPurchased ? "Purchased" : "Not Purchased"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Styled Table with Actions */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              Styled Table with Actions
            </h2>
          </div>

          {/* Bulk actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-3 p-3 mx-4 my-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-blue-700">
                {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""}{" "}
                selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsPurchased}
                className="bg-white hover:bg-green-50 border-green-200 text-green-700"
              >
                <FiCheck className="mr-2 h-4 w-4" />
                Mark All as Purchased
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[50px] py-3">
                    <div className="flex items-center justify-center">
                      <CustomCheckbox
                        checked={
                          selectedItems.size ===
                            items.filter((item) => !item.isPurchased).length &&
                          items.some((item) => !item.isPurchased)
                        }
                        onCheckedChange={handleSelectAll}
                        disabled={!items.some((item) => !item.isPurchased)}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="py-3 font-medium text-gray-700">
                    Item
                  </TableHead>
                  <TableHead className="py-3 font-medium text-gray-700">
                    Category
                  </TableHead>
                  <TableHead className="py-3 font-medium text-gray-700">
                    Quantity
                  </TableHead>
                  <TableHead className="py-3 font-medium text-gray-700">
                    Cost
                  </TableHead>
                  <TableHead className="py-3 font-medium text-gray-700">
                    Source
                  </TableHead>
                  <TableHead className="py-3 text-center font-medium text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      item.isPurchased ? "bg-green-50" : ""
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center">
                        <CustomCheckbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          variant={item.isPurchased ? "purchased" : "default"}
                          disabled={item.isPurchased}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        <span>{item.name}</span>
                        {item.isPurchased && (
                          <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                            Purchased
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700"
                      >
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <span className="text-gray-500 ml-1">{item.unit}</span>
                    </TableCell>
                    <TableCell className="py-4 font-medium text-gray-900">
                      {formatCurrency(item.cost)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={
                          item.source === "auto" ? "secondary" : "outline"
                        }
                        className={
                          item.source === "auto"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {item.source === "auto"
                          ? "Auto (Inventory)"
                          : "Manual (User)"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-center space-x-2">
                        {!item.isPurchased && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full text-green-600 hover:text-green-800 hover:bg-green-50"
                              onClick={() => handleMarkAsPurchased(item.id)}
                              title="Mark as purchased"
                            >
                              <FiShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-full text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Remove item"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {item.isPurchased && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-full text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Remove item"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
