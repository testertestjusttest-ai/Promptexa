-- ============================================================
-- DigiPlyra v3 — one-time secure file/APK delivery
-- Run AFTER 002_v2_features.sql
--
-- How it works:
--  1. Admin uploads APK/files to the PRIVATE 'product-files' bucket
--  2. On payment success, one single-use download token is issued
--     per file (expires in 7 days)
--  3. Customer opens /api/download/<token> → token is consumed
--     immediately, then redirected to a 2-minute signed URL
--  4. The token can never be reused — sharing the link is useless
-- ============================================================

-- ---------- product files (APK etc.) ----------
create table if not exists public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null, -- null = all plans
  file_name text not null,
  version_label text not null default '',
  storage_path text not null,
  file_size bigint not null default 0,
  mime_type text not null default 'application/vnd.android.package-archive',
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_files_product_idx on public.product_files(product_id);

-- ---------- one-time download tokens ----------
create table if not exists public.file_downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  product_file_id uuid not null references public.product_files(id) on delete cascade,
  token text not null unique,
  max_downloads int not null default 1,
  downloads_used int not null default 0,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);
create index if not exists file_downloads_token_idx on public.file_downloads(token);
create index if not exists file_downloads_order_idx on public.file_downloads(order_id);

-- ---------- private storage bucket (no public access) ----------
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;
-- NOTE: no storage.objects policies → only the service role can read.
-- Customers download through /api/download/<token>, never directly.

-- ---------- RLS ----------
alter table public.product_files enable row level security;
alter table public.file_downloads enable row level security;

-- file names visible only to customers who paid for the product
create policy "read purchased product files" on public.product_files
  for select using (
    exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = product_files.product_id
        and o.user_id = auth.uid()
        and o.status in ('paid', 'delivered', 'keys_pending')
    )
  );

-- download tokens visible only to the order owner
create policy "read own download tokens" on public.file_downloads
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = file_downloads.order_id
        and o.user_id = auth.uid()
    )
  );
