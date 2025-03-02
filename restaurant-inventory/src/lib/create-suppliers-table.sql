-- Create UUID extension if it doesn't exist
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
$$; 