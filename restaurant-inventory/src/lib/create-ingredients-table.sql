-- Create UUID extension if it doesn't exist
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
$$; 