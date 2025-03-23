"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FiCheckCircle, FiAlertTriangle, FiCopy } from "react-icons/fi";
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

  const suppliersSqlScript = `-- Create UUID extension if it doesn\'t exist
create extension if not exists "uuid-ossp";

-- Create suppliers table if it doesn\'t exist
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

  const ingredientsSqlScript = `-- Create UUID extension if it doesn\'t exist
create extension if not exists "uuid-ossp";

-- Create ingredients table if it doesn\'t exist
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

  const addExpiryDateScript = `-- Add expiry_date column to ingredients table if it doesn\'t exist
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

  const addSupplierIdScript = `-- Add supplier_id column to ingredients table if it doesn\'t exist
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
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 p-2 sm:p-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Supabase Database Helper
        </h1>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <FiAlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="rounded-md border p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  Tables Status
                </h2>
                <div className="table-responsive overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 font-medium">
                          Table Name
                        </th>
                        <th className="text-left p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables.map((table) => (
                        <tr key={table} className="border-t">
                          <td className="p-2" data-label="Table Name">
                            {table}
                          </td>
                          <td
                            className="p-2 flex justify-end sm:table-cell"
                            data-label="Status"
                          >
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
                              <FiCheckCircle className="h-3 w-3" />
                              <span>Exists</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-md border p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  Columns
                </h2>
                <div className="space-y-2">
                  {Object.entries(tableColumns).map(([table, columns]) => (
                    <div key={table} className="space-y-1">
                      <h3 className="font-medium">{table}</h3>
                      <div className="table-responsive overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left p-2 font-medium">
                                Column Name
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {columns.map((column) => (
                              <tr key={column} className="border-t">
                                <td className="p-2" data-label="Column Name">
                                  {column}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <div className="rounded-md border p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Create Suppliers Table
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() =>
                      copyToClipboard(suppliersSqlScript, setCopiedSuppliers)
                    }
                  >
                    {copiedSuppliers ? "Copied!" : "Copy SQL"}
                    <FiCopy className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="relative">
                  <Textarea
                    className="font-mono text-xs sm:text-sm whitespace-pre overflow-auto h-64 max-h-96 resize-none"
                    readOnly
                    value={suppliersSqlScript}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4">
              <div className="rounded-md border p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Create Ingredients Table
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() =>
                      copyToClipboard(
                        ingredientsSqlScript,
                        setCopiedIngredients
                      )
                    }
                  >
                    {copiedIngredients ? "Copied!" : "Copy SQL"}
                    <FiCopy className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="relative">
                  <Textarea
                    className="font-mono text-xs sm:text-sm whitespace-pre overflow-auto h-64 max-h-96 resize-none"
                    readOnly
                    value={ingredientsSqlScript}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
