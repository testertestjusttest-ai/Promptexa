-- 009: marketplace v2 — demo flag, seller phone, featured boost, escrow fee, notifications

-- 1) Listing extras
alter table public.id_listings
  add column if not exists is_demo boolean not null default false,
  add column if not exists seller_phone text not null default '',
  add column if not exists featured_until timestamptz;

-- 2) Escrow fee bookkeeping (2% admin fee by default)
alter table public.escrow_deals
  add column if not exists fee_bdt numeric(12,2) not null default 0,
  add column if not exists seller_payout_bdt numeric(12,2) not null default 0;

-- 3) In-app notifications (marketplace chat, deal updates, etc.)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  body text not null default '',
  link text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "notif_owner_read" on public.notifications;
create policy "notif_owner_read" on public.notifications
  for select using (auth.uid() = user_id);
drop policy if exists "notif_owner_update" on public.notifications;
create policy "notif_owner_update" on public.notifications
  for update using (auth.uid() = user_id);

-- 4) Marketplace settings defaults (admin fee %, boost price)
insert into public.site_settings (key, value) values
  ('marketplace_fee_percent', to_jsonb(2)),
  ('marketplace_boost_price', to_jsonb(30)),
  ('marketplace_boost_days', to_jsonb(3))
on conflict (key) do nothing;
