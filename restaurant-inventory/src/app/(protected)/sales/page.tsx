"use client";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiCalendar,
  FiSearch,
  FiSave,
  FiFileText,
  FiBarChart2,
  FiMessageSquare,
} from "react-icons/fi";
import Card from "@/components/Card";
import { Dish, Sale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/lib/currency-context";
import { CurrencySelector } from "@/components/currency-selector";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import SaleNotesModal from "@/components/sales/SaleNotesModal";

export default function SalesEntry() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateString, setDateString] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [salesEntries, setSalesEntries] = useState<{ [key: string]: number }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInventoryImpact, setShowInventoryImpact] = useState(false);

  // Notes modal state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Get currency formatter
  const { formatCurrency } = useCurrency();

  // Update selectedDate when dateString changes
  useEffect(() => {
    setSelectedDate(new Date(dateString));
  }, [dateString]);

  // Simulate fetching data from API
  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    setTimeout(() => {
      setDishes([
        {
          id: "1",
          name: "Margherita Pizza",
          price: 12.99,
          ingredients: [
            { ingredientId: "1", quantity: 0.1 }, // Tomatoes
            { ingredientId: "3", quantity: 0.15 }, // Mozzarella
            { ingredientId: "5", quantity: 0.01 }, // Basil
            { ingredientId: "6", quantity: 0.2 }, // Flour
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Spaghetti Bolognese",
          price: 14.99,
          ingredients: [
            { ingredientId: "1", quantity: 0.1 }, // Tomatoes
            { ingredientId: "2", quantity: 0.15 }, // Chicken
            { ingredientId: "8", quantity: 0.05 }, // Onions
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Chicken Alfredo",
          price: 16.99,
          ingredients: [
            { ingredientId: "2", quantity: 0.2 }, // Chicken
            { ingredientId: "3", quantity: 0.1 }, // Mozzarella
            { ingredientId: "7", quantity: 1 }, // Eggs
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Caesar Salad",
          price: 9.99,
          ingredients: [
            { ingredientId: "2", quantity: 0.1 }, // Chicken
            { ingredientId: "5", quantity: 0.02 }, // Basil
            { ingredientId: "7", quantity: 1 }, // Eggs
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Sample past sales
      setSales([
        {
          id: "s1",
          dishId: "1",
          dishName: "Margherita Pizza",
          quantity: 12,
          totalAmount: 155.88,
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "s2",
          dishId: "2",
          dishName: "Spaghetti Bolognese",
          quantity: 8,
          totalAmount: 119.92,
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "s3",
          dishId: "3",
          dishName: "Chicken Alfredo",
          quantity: 6,
          totalAmount: 101.94,
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter dishes based on search term
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter sales based on selected date
  const filteredSales = sales.filter(
    (sale) =>
      format(new Date(sale.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  // Handle quantity change
  const handleQuantityChange = (dishId: string, quantity: number) => {
    setSalesEntries({
      ...salesEntries,
      [dishId]: quantity,
    });
  };

  // Calculate total for the day
  const calculateTotal = () => {
    return Object.entries(salesEntries).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find((d) => d.id === dishId);
      return total + (dish ? dish.price * quantity : 0);
    }, 0);
  };

  // Calculate inventory impact for a dish
  const calculateInventoryImpact = (dishId: string, quantity: number) => {
    const dish = dishes.find((d) => d.id === dishId);
    if (!dish) return [];

    return dish.ingredients.map((ingredient) => {
      const ingredientItem = dishes
        .flatMap((d) => d.ingredients)
        .find((ing) => ing.ingredientId === ingredient.ingredientId);

      return {
        ingredientId: ingredient.ingredientId,
        name: getIngredientName(ingredient.ingredientId),
        quantityUsed: ingredient.quantity * quantity,
        unit: getIngredientUnit(ingredient.ingredientId),
      };
    });
  };

  // Get ingredient name by id
  const getIngredientName = (id: string) => {
    // In a real app, this would fetch from the ingredients list
    const ingredientNames: { [key: string]: string } = {
      "1": "Tomatoes",
      "2": "Chicken Breast",
      "3": "Mozzarella Cheese",
      "4": "Olive Oil",
      "5": "Basil",
      "6": "Flour",
      "7": "Eggs",
      "8": "Onions",
    };
    return ingredientNames[id] || "Unknown Ingredient";
  };

  // Get ingredient unit by id
  const getIngredientUnit = (id: string) => {
    // In a real app, this would fetch from the ingredients list
    const ingredientUnits: { [key: string]: string } = {
      "1": "kg",
      "2": "kg",
      "3": "kg",
      "4": "L",
      "5": "kg",
      "6": "kg",
      "7": "pcs",
      "8": "kg",
    };
    return ingredientUnits[id] || "unit";
  };

  // Submit sales
  const handleSubmitSales = () => {
    // In a real app, this would be an API call to Supabase
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Create new sales records
      const newSales = Object.entries(salesEntries)
        .map(([dishId, quantity]) => {
          const dish = dishes.find((d) => d.id === dishId);
          if (!dish || quantity <= 0) return null;

          return {
            id: `s${Date.now()}-${dishId}`,
            dishId,
            dishName: dish.name,
            quantity,
            totalAmount: dish.price * quantity,
            date: dateString,
            createdAt: new Date().toISOString(),
          };
        })
        .filter(Boolean) as Sale[];

      // Add new sales to the list
      setSales([...newSales, ...sales]);

      // Show success message
      toast({
        title: "Sales recorded successfully",
        description: "Inventory has been updated based on recipe ingredients.",
        action: (
          <ToastAction altText="View Inventory">View Inventory</ToastAction>
        ),
      });

      // Reset form
      setSalesEntries({});
      setIsSubmitting(false);
    }, 1500);
  };

  // Open notes modal for a specific sale
  const openNotesModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsNotesModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            X-Report & Sales Entry
          </h1>
          <p className="text-sm text-muted-foreground">
            Record daily sales and automatically update inventory
          </p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <CurrencySelector />
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-slate-500" />
            <Input
              type="date"
              value={dateString}
              onChange={(e) => setDateString(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="entry" className="flex items-center gap-2">
            <FiFileText className="h-4 w-4" />
            New X-Report Entry
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FiBarChart2 className="h-4 w-4" />
            Sales History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInventoryImpact(!showInventoryImpact)}
                className="whitespace-nowrap"
              >
                {showInventoryImpact
                  ? "Hide Inventory Impact"
                  : "Show Inventory Impact"}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDishes.map((dish) => (
                    <TableRow key={dish.id}>
                      <TableCell className="font-medium">
                        {dish.name}
                        {dish.ingredients.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1">
                            Uses {dish.ingredients.length} ingredients
                          </div>
                        )}
                        {showInventoryImpact && salesEntries[dish.id] > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-slate-700 mb-1">
                              Inventory impact:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {calculateInventoryImpact(
                                dish.id,
                                salesEntries[dish.id]
                              ).map((impact, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  -{impact.quantityUsed} {impact.unit}{" "}
                                  {impact.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(dish.price)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          className="w-20"
                          value={salesEntries[dish.id] || ""}
                          onChange={(e) =>
                            handleQuantityChange(
                              dish.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          dish.price * (salesEntries[dish.id] || 0)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-lg font-bold">
                Total: {formatCurrency(calculateTotal())}
              </div>
              <Button
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmitSales}
                disabled={
                  Object.keys(salesEntries).length === 0 || isSubmitting
                }
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Submit X-Report & Update Inventory
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="mb-6">
            <div className="p-4 bg-slate-50 rounded-lg mb-4">
              <h3 className="font-medium text-slate-800 mb-2">
                Sales Summary for {format(selectedDate, "PPP")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-slate-500">Total Items Sold</div>
                  <div className="text-xl font-bold">
                    {filteredSales.reduce(
                      (sum, sale) => sum + sale.quantity,
                      0
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-slate-500">Total Revenue</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(
                      filteredSales.reduce(
                        (sum, sale) => sum + sale.totalAmount,
                        0
                      )
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-sm text-slate-500">
                    Unique Dishes Sold
                  </div>
                  <div className="text-xl font-bold">
                    {new Set(filteredSales.map((sale) => sale.dishId)).size}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.dishName}
                        </TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(sale.date), "PPP")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openNotesModal(sale)}
                            className="h-8 w-8 p-0"
                            title="View/Add Notes"
                          >
                            <FiMessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        No sales records found for this date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notes Modal */}
      {selectedSale && (
        <SaleNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          sale={selectedSale}
        />
      )}
    </div>
  );
}
