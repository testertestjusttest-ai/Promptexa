-- DigiPlyra v5 — Free Fire ID marketplace (escrow), website-dev service requests, support-admin role
-- Run AFTER 007.

-- ---------- support admin flag ----------
alter table public.profiles
  add column if not exists is_support boolean not null default false;

-- ---------- website development service requests ----------
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  site_type text not null,
  features text not null default '',
  budget_range text not null default '',
  details text not null default '',
  status text not null default 'new',
  admin_note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists service_requests_status_idx on public.service_requests(status);

-- ---------- ID marketplace listings ----------
create table if not exists public.id_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  price_bdt numeric(12,2) not null default 0,
  game_uid text not null default '',
  images text[] not null default '{}',
  status text not null default 'pending',
  views integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists id_listings_status_idx on public.id_listings(status);
create index if not exists id_listings_seller_idx on public.id_listings(seller_id);

-- ---------- listing chat (buyer <-> seller, admin can read all) ----------
create table if not exists public.listing_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.id_listings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists listing_messages_listing_idx on public.listing_messages(listing_id);

-- ---------- escrow deals ----------
create table if not exists public.escrow_deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.id_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount_bdt numeric(12,2) not null default 0,
  status text not null default 'awaiting_payment',
  buyer_trxid text not null default '',
  buyer_sender_number text not null default '',
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists escrow_deals_buyer_idx on public.escrow_deals(buyer_id);
create index if not exists escrow_deals_seller_idx on public.escrow_deals(seller_id);
create index if not exists escrow_deals_status_idx on public.escrow_deals(status);

-- ---------- RLS (service role bypasses; app uses API routes) ----------
alter table public.service_requests enable row level security;
alter table public.id_listings enable row level security;
alter table public.listing_messages enable row level security;
alter table public.escrow_deals enable row level security;

-- public can read approved listings
drop policy if exists "public read approved listings" on public.id_listings;
create policy "public read approved listings" on public.id_listings
  for select using (status = 'approved');

-- sellers read own listings
drop policy if exists "seller read own" on public.id_listings;
create policy "seller read own" on public.id_listings
  for select using (auth.uid() = seller_id);
