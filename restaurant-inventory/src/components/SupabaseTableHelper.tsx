"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiCopy,
  FiExternalLink,
} from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SupabaseTableHelper() {
  const [tables, setTables] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSuppliers, setCopiedSuppliers] = useState(false);
  const [copiedIngredients, setCopiedIngredients] = useState(false);
  const [copiedExpiry, setCopiedExpiry] = useState(false);
  const [copiedSupplierColumn, setCopiedSupplierColumn] = useState(false);

  const suppliersSqlScript = `-- Create UUID extension if it doesn't exist
create extension if not exists "uuid-ossp";

-- Create suppliers table if it doesn't exist
create table if not exists public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index on name for faster queries
create index if not exists suppliers_name_idx on public.suppliers (name);

-- Enable RLS (Row Level Security) on suppliers table
alter table if exists public.suppliers enable row level security;

-- Create RLS policies for suppliers
-- Anyone can view suppliers
drop policy if exists "Anyone can view suppliers" on public.suppliers;
create policy "Anyone can view suppliers" 
  on public.suppliers for select 
  to authenticated 
  using (true);

-- Staff can insert suppliers
drop policy if exists "Staff can insert suppliers" on public.suppliers;
create policy "Staff can insert suppliers" 
  on public.suppliers for insert 
  to authenticated 
  with check (true);

-- Staff can update suppliers
drop policy if exists "Staff can update suppliers" on public.suppliers;
create policy "Staff can update suppliers" 
  on public.suppliers for update 
  to authenticated 
  using (true);

-- Admins and managers can delete suppliers
drop policy if exists "Admins and managers can delete suppliers" on public.suppliers;
create policy "Admins and managers can delete suppliers" 
  on public.suppliers for delete 
  to authenticated 
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- Create trigger for updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_updated_at on public.suppliers;
create trigger handle_updated_at
  before update on public.suppliers
  for each row
  execute function public.handle_updated_at();

-- Insert some sample data if the table is empty
do $$
begin
  if not exists (select 1 from public.suppliers limit 1) then
    insert into public.suppliers (name, contact_name, email, phone, address, notes)
    values 
      ('Farm Fresh Produce', 'John Farmer', 'john@farmfresh.com', '555-123-4567', '123 Farm Rd, Countryville', 'Local farm with organic produce'),
      ('Seaside Seafood Co.', 'Mary Fisher', 'mary@seasideseafood.com', '555-987-6543', '456 Ocean Blvd, Baytown', 'Premium fresh seafood daily'),
      ('Quality Meats Inc.', 'Robert Butcher', 'robert@qualitymeats.com', '555-456-7890', '789 Butcher St, Meatville', 'Specialty in aged steaks and custom cuts'),
      ('Global Spice Traders', 'Sarah Spice', 'sarah@globalspice.com', '555-789-0123', '101 International Way, Spicetown', 'Imported spices from around the world');
  end if;
end;
$$;`;

  const ingredientsSqlScript = `-- Create UUID extension if it doesn't exist
create extension if not exists "uuid-ossp";

-- Create ingredients table if it doesn't exist
create table if not exists public.ingredients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  quantity numeric not null default 0,
  unit text not null,
  reorder_level numeric not null default 0,
  cost numeric not null default 0,
  expiry_date date,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for better performance
create index if not exists ingredients_name_idx on public.ingredients (name);
create index if not exists ingredients_category_idx on public.ingredients (category);
create index if not exists ingredients_expiry_date_idx on public.ingredients (expiry_date);
create index if not exists ingredients_supplier_id_idx on public.ingredients (supplier_id);

-- Enable RLS (Row Level Security) on ingredients table
alter table if exists public.ingredients enable row level security;

-- Create RLS policies for ingredients
-- Anyone can view ingredients
drop policy if exists "Anyone can view ingredients" on public.ingredients;
create policy "Anyone can view ingredients" 
  on public.ingredients for select 
  to authenticated 
  using (true);

-- Staff can insert ingredients
drop policy if exists "Staff can insert ingredients" on public.ingredients;
create policy "Staff can insert ingredients" 
  on public.ingredients for insert 
  to authenticated 
  with check (true);

-- Staff can update ingredients
drop policy if exists "Staff can update ingredients" on public.ingredients;
create policy "Staff can update ingredients" 
  on public.ingredients for update 
  to authenticated 
  using (true);

-- Admins and managers can delete ingredients
drop policy if exists "Admins and managers can delete ingredients" on public.ingredients;
create policy "Admins and managers can delete ingredients" 
  on public.ingredients for delete 
  to authenticated 
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- Create trigger for updated_at timestamp
drop trigger if exists handle_updated_at on public.ingredients;
create trigger handle_updated_at
  before update on public.ingredients
  for each row
  execute function public.handle_updated_at();

-- Insert some sample data if the table is empty
do $$
begin
  if not exists (select 1 from public.ingredients limit 1) then
    insert into public.ingredients (name, category, quantity, unit, reorder_level, cost)
    values 
      ('Chicken Breast', 'Meat', 15.5, 'kg', 5, 8.99),
      ('Rice', 'Grains', 25, 'kg', 10, 1.99),
      ('Olive Oil', 'Oils', 5, 'L', 2, 12.50),
      ('Tomatoes', 'Produce', 10, 'kg', 3, 3.99),
      ('Lettuce', 'Produce', 8, 'kg', 2, 2.49),
      ('Garlic', 'Produce', 3, 'kg', 1, 4.99),
      ('Salt', 'Spices', 5, 'kg', 1, 1.25),
      ('Black Pepper', 'Spices', 2, 'kg', 0.5, 15.99),
      ('Flour', 'Baking', 20, 'kg', 5, 1.79),
      ('Sugar', 'Baking', 10, 'kg', 3, 2.29);
  end if;
end;
$$;`;

  const addExpiryDateScript = `-- Add expiry_date column to ingredients table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='ingredients' AND column_name='expiry_date'
    ) THEN
        -- Add the column
        ALTER TABLE public.ingredients ADD COLUMN expiry_date DATE;
        
        -- Create an index for better performance
        CREATE INDEX IF NOT EXISTS ingredients_expiry_date_idx ON public.ingredients (expiry_date);
        
        RAISE NOTICE 'Added expiry_date column to ingredients table';
    ELSE
        RAISE NOTICE 'expiry_date column already exists in ingredients table';
    END IF;
END $$;`;

  const addSupplierIdScript = `-- Add supplier_id column to ingredients table if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='ingredients' AND column_name='supplier_id'
    ) THEN
        -- Add the column
        ALTER TABLE public.ingredients ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;
        
        -- Create an index for better performance
        CREATE INDEX IF NOT EXISTS ingredients_supplier_id_idx ON public.ingredients (supplier_id);
        
        RAISE NOTICE 'Added supplier_id column to ingredients table';
    ELSE
        RAISE NOTICE 'supplier_id column already exists in ingredients table';
    END IF;
END $$;`;

  useEffect(() => {
    const checkTables = async () => {
      setLoading(true);
      setError(null);
      try {
        // List all tables
        const { data: tablesData, error: tablesError } = await supabase
          .from("pg_tables")
          .select("tablename")
          .eq("schemaname", "public");

        if (tablesError) {
          throw tablesError;
        }

        if (tablesData) {
          const tableNames = tablesData.map(
            (t: { tablename: string }) => t.tablename
          );
          setTables(tableNames);

          // Check columns for ingredients table if it exists
          if (tableNames.includes("ingredients")) {
            try {
              const { data: columnsData, error: columnsError } = await supabase
                .from("information_schema.columns")
                .select("column_name")
                .eq("table_name", "ingredients");

              if (columnsError) {
                console.warn("Error getting columns:", columnsError);
              } else if (columnsData) {
                const columns = columnsData.map(
                  (col: { column_name: string }) => col.column_name
                );
                setTableColumns((prev) => ({ ...prev, ingredients: columns }));
              }
            } catch (colError) {
              console.warn("Error checking ingredient columns:", colError);
            }
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Error checking tables:", err);
        setError(errorMessage || "Error checking database tables");
      } finally {
        setLoading(false);
      }
    };

    checkTables();
  }, []);

  const copyToClipboard = (
    script: string,
    setStateFn: (copied: boolean) => void
  ) => {
    navigator.clipboard.writeText(script).then(
      () => {
        setStateFn(true);
        setTimeout(() => setStateFn(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const hasSuppliersTable = tables.includes("suppliers");
  const hasIngredientsTable = tables.includes("ingredients");
  const hasExpiryDateColumn =
    tableColumns.ingredients?.includes("expiry_date") || false;
  const hasSupplierIdColumn =
    tableColumns.ingredients?.includes("supplier_id") || false;

  const testSupplierService = async () => {
    // Implementation of testSupplierService
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      <h2 className="text-xl font-bold">Table Health Check</h2>

      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          <span>Checking tables...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <FiAlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <p className="font-medium">Detected tables:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tables.map((table) => (
                <div
                  key={table}
                  className={`p-2 border rounded ${
                    table === "suppliers" || table === "ingredients"
                      ? "bg-green-50 border-green-200"
                      : ""
                  }`}
                >
                  {table}{" "}
                  {(table === "suppliers" || table === "ingredients") && (
                    <FiCheckCircle className="inline text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Tabs defaultValue="suppliers">
            <TabsList className="mb-4">
              <TabsTrigger value="suppliers">Suppliers Table</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients Table</TabsTrigger>
              <TabsTrigger value="columns">Missing Columns</TabsTrigger>
            </TabsList>

            <TabsContent value="suppliers">
              {!hasSuppliersTable && (
                <Alert>
                  <FiAlertTriangle className="h-4 w-4" />
                  <AlertTitle>Suppliers table not found</AlertTitle>
                  <AlertDescription>
                    You need to create the suppliers table in your Supabase
                    database. Copy the SQL script below and run it in the SQL
                    Editor.
                  </AlertDescription>
                </Alert>
              )}

              {!hasSuppliersTable && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">
                      SQL Script to create suppliers table:
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(suppliersSqlScript, setCopiedSuppliers)
                      }
                      className="flex items-center space-x-1"
                    >
                      <FiCopy className="h-4 w-4" />
                      <span>{copiedSuppliers ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                  <Textarea
                    value={suppliersSqlScript}
                    readOnly
                    className="font-mono text-sm h-64"
                  />
                </div>
              )}

              {hasSuppliersTable && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <FiCheckCircle className="h-4 w-4" />
                  <AlertTitle>Suppliers table exists</AlertTitle>
                  <AlertDescription>
                    The suppliers table is already created in your database.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Button
                  onClick={testSupplierService}
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  {loading && (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                  )}
                  {loading ? "Testing..." : "Run Test"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ingredients">
              {!hasIngredientsTable && (
                <Alert>
                  <FiAlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ingredients table not found</AlertTitle>
                  <AlertDescription>
                    You need to create the ingredients table in your Supabase
                    database. Copy the SQL script below and run it in the SQL
                    Editor.
                    <div className="mt-2 text-amber-600 font-medium">
                      IMPORTANT: The ingredients table references the suppliers
                      table. Please make sure to create the suppliers table
                      first.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!hasIngredientsTable && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">
                      SQL Script to create ingredients table:
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          ingredientsSqlScript,
                          setCopiedIngredients
                        )
                      }
                      className="flex items-center space-x-1"
                    >
                      <FiCopy className="h-4 w-4" />
                      <span>{copiedIngredients ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                  <Textarea
                    value={ingredientsSqlScript}
                    readOnly
                    className="font-mono text-sm h-64"
                  />
                </div>
              )}

              {hasIngredientsTable && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <FiCheckCircle className="h-4 w-4" />
                  <AlertTitle>Ingredients table exists</AlertTitle>
                  <AlertDescription>
                    The ingredients table is already created in your database.
                    Check the &quot;Missing Columns&quot; tab to make sure it
                    has all the required columns.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="columns">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Column Diagnostics</h3>

                {hasIngredientsTable && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={
                          hasExpiryDateColumn
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {hasExpiryDateColumn ? (
                          <FiCheckCircle className="h-5 w-5" />
                        ) : (
                          <FiAlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">expiry_date column</h4>
                        <p className="text-sm text-muted-foreground">
                          {hasExpiryDateColumn
                            ? "Column exists in ingredients table"
                            : "Column is missing from ingredients table"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div
                        className={
                          hasSupplierIdColumn
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {hasSupplierIdColumn ? (
                          <FiCheckCircle className="h-5 w-5" />
                        ) : (
                          <FiAlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">supplier_id column</h4>
                        <p className="text-sm text-muted-foreground">
                          {hasSupplierIdColumn
                            ? "Column exists in ingredients table"
                            : "Column is missing from ingredients table"}
                        </p>
                      </div>
                    </div>

                    {!hasExpiryDateColumn && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-medium">
                            SQL Script to add expiry_date column:
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                addExpiryDateScript,
                                setCopiedExpiry
                              )
                            }
                            className="flex items-center space-x-1"
                          >
                            <FiCopy className="h-4 w-4" />
                            <span>{copiedExpiry ? "Copied!" : "Copy"}</span>
                          </Button>
                        </div>
                        <Textarea
                          value={addExpiryDateScript}
                          readOnly
                          className="font-mono text-sm h-32"
                        />
                      </div>
                    )}

                    {!hasSupplierIdColumn && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <h3 className="font-medium">
                            SQL Script to add supplier_id column:
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                addSupplierIdScript,
                                setCopiedSupplierColumn
                              )
                            }
                            className="flex items-center space-x-1"
                          >
                            <FiCopy className="h-4 w-4" />
                            <span>
                              {copiedSupplierColumn ? "Copied!" : "Copy"}
                            </span>
                          </Button>
                        </div>
                        <Alert className="mb-2">
                          <FiAlertTriangle className="h-4 w-4" />
                          <AlertTitle>Important</AlertTitle>
                          <AlertDescription>
                            Make sure the suppliers table exists before adding
                            this column.
                          </AlertDescription>
                        </Alert>
                        <Textarea
                          value={addSupplierIdScript}
                          readOnly
                          className="font-mono text-sm h-32"
                        />
                      </div>
                    )}

                    {hasExpiryDateColumn && hasSupplierIdColumn && (
                      <Alert className="bg-green-50 border-green-200 text-green-800">
                        <FiCheckCircle className="h-4 w-4" />
                        <AlertTitle>All columns present</AlertTitle>
                        <AlertDescription>
                          The ingredients table has all required columns.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {!hasIngredientsTable && (
                  <Alert>
                    <FiAlertTriangle className="h-4 w-4" />
                    <AlertTitle>Ingredients table not found</AlertTitle>
                    <AlertDescription>
                      You need to create the ingredients table first. Go to the
                      &quot;Ingredients Table&quot; tab.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-4">
            <a
              href="https://app.supabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Open Supabase Dashboard{" "}
              <FiExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
