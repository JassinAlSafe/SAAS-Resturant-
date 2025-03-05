-- Schema for Restaurant Inventory Management System

-- Create UUID extension if it doesn't exist
create extension if not exists "uuid-ossp";

-- Enable RLS (Row Level Security)
alter table if exists public.profiles enable row level security;
alter table if exists public.ingredients enable row level security;
alter table if exists public.dishes enable row level security;
alter table if exists public.dish_ingredients enable row level security;
alter table if exists public.sales enable row level security;
alter table if exists public.suppliers enable row level security;

-- Create tables
-- Profiles table (for users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  name text,
  role text check (role in ('admin', 'manager', 'staff')) not null default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Suppliers table
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

-- Ingredients table
create table if not exists public.ingredients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  quantity numeric not null default 0,
  unit text not null,
  reorder_level numeric not null default 0,
  cost numeric not null default 0,
  expiry_date date,
  supplier_id uuid references public.suppliers on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dishes table
create table if not exists public.dishes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dish Ingredients junction table
create table if not exists public.dish_ingredients (
  id uuid default uuid_generate_v4() primary key,
  dish_id uuid references public.dishes on delete cascade not null,
  ingredient_id uuid references public.ingredients on delete cascade not null,
  quantity numeric not null default 0,
  unique (dish_id, ingredient_id)
);

-- Sales table
create table if not exists public.sales (
  id uuid default uuid_generate_v4() primary key,
  dish_id uuid references public.dishes on delete restrict not null,
  quantity integer not null default 0,
  total_amount numeric not null default 0,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete set null
);

-- Create indexes for performance
create index if not exists ingredients_category_idx on public.ingredients (category);
create index if not exists ingredients_expiry_date_idx on public.ingredients (expiry_date);
create index if not exists ingredients_supplier_id_idx on public.ingredients (supplier_id);
create index if not exists sales_date_idx on public.sales (date);
create index if not exists dish_ingredients_dish_id_idx on public.dish_ingredients (dish_id);
create index if not exists dish_ingredients_ingredient_id_idx on public.dish_ingredients (ingredient_id);

-- Create functions
-- Function to update ingredient quantity
create or replace function public.update_ingredient_quantity(p_ingredient_id uuid, p_quantity_change numeric)
returns void as $$
begin
  update public.ingredients
  set 
    quantity = quantity + p_quantity_change,
    updated_at = now()
  where id = p_ingredient_id;
end;
$$ language plpgsql security definer;

-- Function to begin a transaction
create or replace function public.begin_transaction()
returns void as $$
begin
  -- Nothing needed here as Supabase automatically starts a transaction
end;
$$ language plpgsql security definer;

-- Function to commit a transaction
create or replace function public.commit_transaction()
returns void as $$
begin
  -- Nothing needed here as the transaction will be committed automatically
end;
$$ language plpgsql security definer;

-- Function to rollback a transaction
create or replace function public.rollback_transaction()
returns void as $$
begin
  -- This will cause the transaction to be rolled back
  raise exception 'Transaction rolled back';
end;
$$ language plpgsql security definer;

-- Create RLS policies
-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Ingredients policies
create policy "Anyone can view ingredients"
  on public.ingredients for select
  to authenticated
  using (true);

create policy "Staff can insert ingredients"
  on public.ingredients for insert
  to authenticated
  with check (true);

create policy "Staff can update ingredients"
  on public.ingredients for update
  to authenticated
  using (true);

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

-- Dishes policies
create policy "Anyone can view dishes"
  on public.dishes for select
  to authenticated
  using (true);

create policy "Staff can insert dishes"
  on public.dishes for insert
  to authenticated
  with check (true);

create policy "Staff can update dishes"
  on public.dishes for update
  to authenticated
  using (true);

create policy "Admins and managers can delete dishes"
  on public.dishes for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- Dish Ingredients policies
create policy "Anyone can view dish ingredients"
  on public.dish_ingredients for select
  to authenticated
  using (true);

create policy "Staff can insert dish ingredients"
  on public.dish_ingredients for insert
  to authenticated
  with check (true);

create policy "Staff can update dish ingredients"
  on public.dish_ingredients for update
  to authenticated
  using (true);

create policy "Staff can delete dish ingredients"
  on public.dish_ingredients for delete
  to authenticated
  using (true);

-- Sales policies
create policy "Anyone can view sales"
  on public.sales for select
  to authenticated
  using (true);

create policy "Staff can insert sales"
  on public.sales for insert
  to authenticated
  with check (true);

create policy "Admins and managers can update sales"
  on public.sales for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

create policy "Admins and managers can delete sales"
  on public.sales for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'manager')
    )
  );

-- Suppliers policies
create policy "Anyone can view suppliers"
  on public.suppliers for select
  to authenticated
  using (true);

create policy "Staff can insert suppliers"
  on public.suppliers for insert
  to authenticated
  with check (true);

create policy "Staff can update suppliers"
  on public.suppliers for update
  to authenticated
  using (true);

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

-- Create triggers
-- Update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.ingredients
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.dishes
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.suppliers
  for each row
  execute function public.handle_updated_at(); 