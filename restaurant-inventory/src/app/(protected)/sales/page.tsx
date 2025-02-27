"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiCalendar, FiSearch, FiSave } from "react-icons/fi";
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

  // Submit sales
  const handleSubmitSales = () => {
    // In a real app, this would be an API call to Supabase
    alert(
      "Sales submitted successfully! Inventory will be updated automatically."
    );
    setSalesEntries({});
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
          <h1 className="text-2xl font-bold text-slate-800">Sales Entry</h1>
          <p className="text-sm text-slate-500">
            Record daily sales from X-report and auto-update inventory
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
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
          <TabsTrigger value="entry">New Sales Entry</TabsTrigger>
          <TabsTrigger value="history">Sales History</TabsTrigger>
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
                      <TableCell className="font-medium">{dish.name}</TableCell>
                      <TableCell>${dish.price.toFixed(2)}</TableCell>
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
                        $
                        {((salesEntries[dish.id] || 0) * dish.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-lg font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
              <Button
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmitSales}
                disabled={Object.keys(salesEntries).length === 0}
              >
                <FiSave className="mr-2 h-4 w-4" />
                Submit Sales & Update Inventory
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
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
                        <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {format(new Date(sale.date), "PPP")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
    </div>
  );
}
