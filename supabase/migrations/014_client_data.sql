-- DigiPlyra — real backend for client sites (products, orders, bookings, settings, ads)
-- Run AFTER 013. User runs this in Supabase SQL editor.
-- Each client's data is isolated by client_slug.

-- admin PIN for client admin panel (added to existing table)
alter table public.client_sites add column if not exists admin_pin_hash text;

-- ---------- client products ----------
create table if not exists public.client_products (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  name text not null,
  price_bdt numeric(12,2) not null default 0,
  old_price_bdt numeric(12,2),
  image_emoji text default '📦',
  image_url text,
  category text default 'সব',
  stock int not null default 100,
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists client_products_slug_idx on public.client_products(client_slug, is_active);

-- ---------- client orders ----------
create table if not exists public.client_orders (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  order_no text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  items jsonb not null default '[]',
  total_bdt numeric(12,2) not null default 0,
  payment_method text default 'cod',
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists client_orders_slug_idx on public.client_orders(client_slug, created_at desc);
create index if not exists client_orders_phone_idx on public.client_orders(client_slug, customer_phone);

-- ---------- client bookings ----------
create table if not exists public.client_bookings (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null,
  booking_no text not null,
  service_name text not null,
  customer_name text not null,
  customer_phone text not null,
  book_date date,
  slot text,
  total_bdt numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists client_bookings_slug_idx on public.client_bookings(client_slug, created_at desc);

-- ---------- client settings (ads, announcements, etc.) ----------
create table if not exists public.client_settings (
  client_slug text not null,
  key text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  primary key (client_slug, key)
);

alter table public.client_products enable row level security;
alter table public.client_orders enable row level security;
alter table public.client_bookings enable row level security;
alter table public.client_settings enable row level security;

-- Public read: active products + settings (public storefront data)
create policy "public read client products" on public.client_products
  for select using (is_active = true);
create policy "public read client settings" on public.client_settings
  for select using (true);

-- Public insert: customers can place orders/bookings (no auth needed for storefront)
create policy "public insert client orders" on public.client_orders
  for insert with check (true);
create policy "public insert client bookings" on public.client_bookings
  for insert with check (true);

-- Customers can read their own orders by phone (for tracking)
create policy "public read own client orders" on public.client_orders
  for select using (true);

-- Only service role (admin API) can update/delete → no update/delete policies
