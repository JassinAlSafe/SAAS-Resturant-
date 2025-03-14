import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface DishDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  dishId: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  ingredients: Ingredient[];
  formatCurrency: (amount: number) => string;
  isLoading?: boolean;
  periodLabel: string;
}

export function DishDetailsModal({
  isOpen,
  onClose,
  dishName,
  dishId,
  quantity,
  revenue,
  cost,
  profit,
  ingredients,
  formatCurrency,
  isLoading = false,
  periodLabel,
}: DishDetailsProps) {
  // Calculate profit margin
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UtensilsCrossed className="h-5 w-5" />
            {dishName}
          </DialogTitle>
          <DialogDescription>
            Dish performance for {periodLabel}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto" />
            <div className="h-20 bg-muted rounded animate-pulse" />
            <div className="h-40 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-secondary/20 rounded-md p-3">
                <div className="text-sm text-muted-foreground">Orders</div>
                <div className="text-2xl font-semibold">{quantity}</div>
              </div>
              <div className="bg-secondary/20 rounded-md p-3">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(revenue)}
                </div>
              </div>
              <div className="bg-secondary/20 rounded-md p-3">
                <div className="text-sm text-muted-foreground">Cost</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(cost)}
                </div>
              </div>
              <div
                className={`rounded-md p-3 ${
                  profitMargin >= 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <div className="text-sm text-muted-foreground">
                  Profit Margin
                </div>
                <div className="text-2xl font-semibold">
                  {profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="mt-4 border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Profit Analysis</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Revenue per unit:</span>
                    <span className="font-medium">
                      {formatCurrency(revenue / quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cost per unit:</span>
                    <span className="font-medium">
                      {formatCurrency(cost / quantity)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Profit per unit:</span>
                    <span className="font-medium">
                      {formatCurrency(profit / quantity)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Cost vs. Revenue</span>
                    <span>{((cost / revenue) * 100).toFixed(1)}% Cost</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(cost / revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Ingredients Used</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">
                      Quantity Per Dish
                    </TableHead>
                    <TableHead className="text-right">Total Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>
                        <Link
                          href={`/inventory?highlight=${ingredient.id}`}
                          className="hover:underline flex items-center"
                        >
                          {ingredient.name}
                          <ChevronRight className="h-4 w-4 inline ml-1" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {ingredient.quantity} {ingredient.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {(ingredient.quantity * quantity).toFixed(1)}{" "}
                        {ingredient.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                  {ingredients.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-4"
                      >
                        No ingredient data available for this dish
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <Link href={`/recipes/${dishId}`}>
                <Button variant="outline">View Recipe</Button>
              </Link>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
