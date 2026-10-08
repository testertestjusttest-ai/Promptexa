-- ============================================================
-- DigiPlyra — digital products store schema
-- Run this in Supabase SQL editor (or via supabase db push)
-- ============================================================

-- ---------- helpers ----------
create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_bn text not null,
  name_en text not null,
  icon text not null default '✦',
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline_bn text not null default '',
  description_bn text not null default '',
  features_bn text[] not null default '{}',
  delivery_note_bn text not null default 'পেমেন্ট কনফার্ম হওয়ার সাথে সাথে আপনার অ্যাকাউন্ট/লাইসেন্স কী ড্যাশবোর্ডে ডেলিভারি দেওয়া হবে।',
  badge text not null default '⬢',          -- logo glyph shown on card
  badge_bg text not null default '#8b5cf6', -- brand color for the badge
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- plans (pricing tiers per product) ----------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label_bn text not null,               -- e.g. '১ মাস', '৬ মাস', 'লাইফটাইম'
  duration_days int,                    -- null = lifetime
  price_bdt int not null,
  old_price_bdt int,
  is_popular boolean not null default false,
  sort int not null default 0,
  is_active boolean not null default true,
  unique(product_id, label_bn)
);

-- ---------- product_keys (license / account inventory) ----------
-- Admin preloads keys or account credentials here. On successful payment
-- the oldest unused key is auto-assigned to the order.
create table if not exists public.product_keys (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null, -- null = fits any plan
  key_text text not null unique,          -- license key OR "email : password" etc.
  key_note text,                        -- optional instruction shown with the key
  is_used boolean not null default false,
  used_by_order_id uuid,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,     -- e.g. DP-20261008-XXXX
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text not null default 'pending'
    check (status in ('pending','payment_pending','paid','delivered','cancelled','refunded','keys_pending')),
  payment_method text
    check (payment_method in ('sslcommerz','bkash','nagad','rocket')),
  total_bdt int not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- ---------- order_items ----------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  plan_id uuid references public.plans(id) on delete set null,
  product_name text not null,
  plan_label_bn text not null,
  price_bdt int not null,
  qty int not null default 1
);

-- ---------- payments ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null
    check (method in ('sslcommerz','bkash','nagad','rocket')),
  amount_bdt int not null,
  -- manual payments
  sender_number text,
  trx_id text,
  -- sslcommerz
  ssl_tran_id text,
  ssl_val_id text,
  status text not null default 'pending'
    check (status in ('pending','success','failed','cancelled')),
  gateway_response jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists payments_order_idx on public.payments(order_id);

-- ---------- delivered_keys ----------
create table if not exists public.delivered_keys (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  product_key_id uuid references public.product_keys(id) on delete set null,
  key_text text not null,                -- snapshot at delivery time
  key_note text,
  delivered_at timestamptz not null default now()
);

-- ---------- site_settings (key/value) ----------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('payment_numbers', '{"bkash": "", "nagad": "", "rocket": ""}'::jsonb),
  ('sslcommerz', '{"enabled": false, "sandbox": true}'::jsonb),
  ('store', '{"name": "DigiPlyra", "tagline": "অরিজিনাল প্রিমিয়াম সাবস্ক্রিপশন, সবচেয়ে কম দামে", "support_whatsapp": "", "notice_bn": "ডেলিভারি সাধারণত পেমেন্টের ৫–৩০ মিনিটের মধ্যে সম্পন্ন হয়।"}'::jsonb)
on conflict (key) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.plans enable row level security;
alter table public.product_keys enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.delivered_keys enable row level security;
alter table public.site_settings enable row level security;

-- public read: active catalogue + payment numbers + store info
create policy "public read categories" on public.categories
  for select using (is_active = true);
create policy "public read products" on public.products
  for select using (is_active = true);
create policy "public read plans" on public.plans
  for select using (is_active = true);
create policy "public read store settings" on public.site_settings
  for select using (key in ('payment_numbers','store'));

-- profiles: user reads/updates own
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile upsert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

-- orders: anyone can create (guest checkout); user reads own
create policy "create order" on public.orders
  for insert with check (true);
create policy "read own orders" on public.orders
  for select using (auth.uid() = user_id);

-- order_items / payments: create allowed (checkout flow), read own via order
create policy "create order items" on public.order_items
  for insert with check (true);
create policy "create payments" on public.payments
  for insert with check (true);
create policy "read own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "read own payments" on public.payments
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "read own delivered keys" on public.delivered_keys
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- product_keys & full site_settings: service-role only (no public policies).
-- Admin panel uses the service-role key server-side after checking profiles.is_admin.
