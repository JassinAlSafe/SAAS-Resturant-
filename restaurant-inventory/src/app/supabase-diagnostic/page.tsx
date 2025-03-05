"use client";

import { useState } from "react";
import SupabaseTableHelper from "@/components/SupabaseTableHelper";
import { Button } from "@/components/ui/button";
import { supplierService } from "@/lib/services/supplier-service";
import { inventoryService } from "@/lib/services/inventory-service";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Supplier } from "@/lib/types";
import { InventoryItem } from "@/lib/types";

export default function SupabaseDiagnosticPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [activeTab, setActiveTab] = useState("suppliers");

  const testSupplierService = async () => {
    setLoading(true);
    setError(null);
    setResult("");

    try {
      // Test Get suppliers
      console.log("Testing supplierService.getSuppliers()...");
      const suppliersData = await supplierService.getSuppliers();
      setSuppliers(suppliersData);

      let resultText = `✅ Successfully fetched ${suppliersData.length} suppliers\n\n`;

      if (suppliersData.length > 0) {
        resultText += "Sample supplier data:\n";
        resultText += JSON.stringify(suppliersData[0], null, 2);
      } else {
        resultText +=
          "No suppliers found. You may need to add some suppliers.\n";
      }

      setResult(resultText);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error in supplier diagnostic test:", error);
      setError(errorMessage);
      setResult(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testInventoryService = async () => {
    setLoading(true);
    setError(null);
    setResult("");

    try {
      // Test Get inventory items
      console.log("Testing inventoryService.getItems()...");
      const inventoryData = await inventoryService.getItems();
      setInventory(inventoryData);

      let resultText = `✅ Successfully fetched ${inventoryData.length} inventory items\n\n`;

      if (inventoryData.length > 0) {
        resultText += "Sample inventory data:\n";
        resultText += JSON.stringify(inventoryData[0], null, 2);
      } else {
        resultText +=
          "No inventory items found. You may need to add some items.\n";
      }

      setResult(resultText);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error in inventory diagnostic test:", error);
      setError(errorMessage);
      setResult(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Supabase Diagnostic</h1>
        <p className="text-muted-foreground">
          This page helps diagnose and fix issues with your Supabase connection
        </p>
      </div>

      <SupabaseTableHelper />

      <div className="p-4 border rounded-md space-y-4">
        <h2 className="text-xl font-bold">Test Database Services</h2>

        <Tabs defaultValue="suppliers" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers" className="space-y-4 mt-4">
            <p>Test the connection to the suppliers table:</p>
            <div>
              <Button
                onClick={testSupplierService}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading && activeTab === "suppliers" && (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                )}
                {loading && activeTab === "suppliers"
                  ? "Testing..."
                  : "Test Suppliers Table"}
              </Button>
            </div>

            {suppliers.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">
                  Suppliers List ({suppliers.length}):
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Contact</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-t">
                          <td className="px-4 py-2 font-mono text-xs">
                            {supplier.id}
                          </td>
                          <td className="px-4 py-2">{supplier.name}</td>
                          <td className="px-4 py-2">{supplier.contactName}</td>
                          <td className="px-4 py-2">{supplier.email}</td>
                          <td className="px-4 py-2">{supplier.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <p>Test the connection to the ingredients table:</p>
            <div>
              <Button
                onClick={testInventoryService}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading && activeTab === "inventory" && (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                )}
                {loading && activeTab === "inventory"
                  ? "Testing..."
                  : "Test Ingredients Table"}
              </Button>
            </div>

            {inventory.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">
                  Inventory Items ({inventory.length}):
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Unit</th>
                        <th className="px-4 py-2 text-left">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-2 font-mono text-xs">
                            {item.id}
                          </td>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.category}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">{item.unit}</td>
                          <td className="px-4 py-2">${item.cost_per_unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Results:</h3>
            <Textarea
              value={result}
              readOnly
              className="font-mono text-sm h-64"
            />
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
            <h3 className="font-medium">Error:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="p-4 border rounded-md space-y-4">
        <h2 className="text-xl font-bold">Troubleshooting Instructions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              1. Run the SQL Scripts in Supabase
            </h3>
            <p className="mb-2">
              Follow these steps to create the required tables:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>
                Go to your{" "}
                <a
                  href="https://app.supabase.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>Open the SQL Editor</li>
              <li>Create a new query</li>
              <li>
                Run the SQL scripts for suppliers and ingredients tables (from
                the &apos;SQL Scripts&apos; section below)
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              2. Check for Common Issues
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Ensure your Supabase URL and Anon Key are correct in .env.local
              </li>
              <li>Verify RLS policies allow proper access to these tables</li>
              <li>Check for any errors in the browser console</li>
              <li>
                Ensure you&apos;re authenticated - most RLS policies require
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
