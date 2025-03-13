-- Create inventory_items table
create table if not exists public.inventory_items (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    current_stock decimal not null default 0,
    unit text not null,
    restaurant_id text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create inventory_usage table
create table if not exists public.inventory_usage (
    id uuid default gen_random_uuid() primary key,
    date timestamp with time zone not null,
    quantity decimal not null,
    inventory_item_id uuid references public.inventory_items(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index if not exists inventory_items_restaurant_id_idx on public.inventory_items(restaurant_id);
create index if not exists inventory_usage_inventory_item_id_idx on public.inventory_usage(inventory_item_id);
create index if not exists inventory_usage_date_idx on public.inventory_usage(date);

-- Enable Row Level Security (RLS)
alter table public.inventory_items enable row level security;
alter table public.inventory_usage enable row level security;

-- Create RLS policies
create policy "Users can view their own inventory items"
    on public.inventory_items for select
    using (auth.uid()::text = restaurant_id);

create policy "Users can insert their own inventory items"
    on public.inventory_items for insert
    with check (auth.uid()::text = restaurant_id);

create policy "Users can update their own inventory items"
    on public.inventory_items for update
    using (auth.uid()::text = restaurant_id);

create policy "Users can delete their own inventory items"
    on public.inventory_items for delete
    using (auth.uid()::text = restaurant_id);

-- Inventory usage policies
create policy "Users can view usage of their inventory items"
    on public.inventory_usage for select
    using (exists (
        select 1 from public.inventory_items
        where id = inventory_usage.inventory_item_id
        and restaurant_id = auth.uid()::text
    ));

create policy "Users can insert usage for their inventory items"
    on public.inventory_usage for insert
    with check (exists (
        select 1 from public.inventory_items
        where id = inventory_usage.inventory_item_id
        and restaurant_id = auth.uid()::text
    ));

create policy "Users can update usage of their inventory items"
    on public.inventory_usage for update
    using (exists (
        select 1 from public.inventory_items
        where id = inventory_usage.inventory_item_id
        and restaurant_id = auth.uid()::text
    ));

create policy "Users can delete usage of their inventory items"
    on public.inventory_usage for delete
    using (exists (
        select 1 from public.inventory_items
        where id = inventory_usage.inventory_item_id
        and restaurant_id = auth.uid()::text
    )); 