"use client";

import { Dish } from "@/lib/types";
import Card from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FiCalendar, FiPlus, FiSave } from "react-icons/fi";
import { useCurrency } from "@/lib/currency-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface SalesEntryFormProps {
  dishes: Dish[];
  salesEntries: { [key: string]: number };
  dateString: string;
  onDateChange: (value: string) => void;
  onQuantityChange: (dishId: string, quantity: number) => void;
  onSubmit: () => Promise<boolean>;
  total: number;
  isSubmitting: boolean;
  onToggleInventoryImpact: () => void;
  showInventoryImpact: boolean;
  calculateInventoryImpact: (dishId: string, quantity: number) => any[];
}

export default function SalesEntryForm({
  dishes,
  salesEntries,
  dateString,
  onDateChange,
  onQuantityChange,
  onSubmit,
  total,
  isSubmitting,
  onToggleInventoryImpact,
  showInventoryImpact,
  calculateInventoryImpact,
}: SalesEntryFormProps) {
  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Handle submission with confirmation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium mb-4">Record Daily Sales</h3>

          <div className="mb-4">
            <Label htmlFor="sale-date" className="mb-2 block">
              Sales Date
            </Label>
            <div className="relative max-w-xs">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sale-date"
                type="date"
                value={dateString}
                onChange={(e) => onDateChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dish</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dishes.map((dish) => {
                  const quantity = salesEntries[dish.id] || 0;
                  const totalPrice = dish.price * quantity;

                  return (
                    <TableRow key={dish.id}>
                      <TableCell className="font-medium">{dish.name}</TableCell>
                      <TableCell>{formatCurrency(dish.price)}</TableCell>
                      <TableCell className="w-40">
                        <Input
                          type="number"
                          min="0"
                          value={quantity || ""}
                          onChange={(e) =>
                            onQuantityChange(
                              dish.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(totalPrice)}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total:
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {showInventoryImpact && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Inventory Impact</h4>
              <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left">Ingredient</th>
                      <th className="py-2 px-3 text-left">Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(salesEntries)
                      .filter(([_, quantity]) => quantity > 0)
                      .flatMap(([dishId, quantity]) => {
                        return calculateInventoryImpact(dishId, quantity).map(
                          (impact, index) => (
                            <tr
                              key={`${dishId}-${impact.ingredientId}-${index}`}
                              className="border-b"
                            >
                              <td className="py-2 px-3">{impact.name}</td>
                              <td className="py-2 px-3">
                                {impact.quantityUsed.toFixed(2)} {impact.unit}
                              </td>
                            </tr>
                          )
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onToggleInventoryImpact}
          >
            {showInventoryImpact ? "Hide" : "Show"} Inventory Impact
          </Button>

          <Button type="submit" disabled={isSubmitting || total === 0}>
            {isSubmitting ? "Saving..." : "Save Sales"}
            {!isSubmitting && <FiSave className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Card>
  );
}
