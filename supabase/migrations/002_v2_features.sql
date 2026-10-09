-- ============================================================
-- DigiPlyra v2 — slider, product images, stock control, ads, PWA
-- Run AFTER 001_digiplyra_store.sql
-- ============================================================

-- ---------- hero slides ----------
create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  title_bn text not null,
  subtitle_bn text not null default '',
  cta_text text not null default 'এখনই কিনুন',
  cta_link text not null default '/shop',
  image_url text,                 -- optional uploaded banner image
  bg_from text not null default '#8b5cf6',
  bg_to text not null default '#d7ff3f',
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- products: images + stock control ----------
alter table public.products
  add column if not exists image_url text,
  add column if not exists sold_out_manual boolean not null default false,
  add column if not exists track_stock boolean not null default true;

-- ---------- public stock counts (no key text exposed) ----------
create or replace function public.get_product_stock()
returns table (product_id uuid, stock int)
language sql security definer set search_path = public as $$
  select product_id, count(*)::int
  from public.product_keys
  where is_used = false
  group by product_id;
$$;
grant execute on function public.get_product_stock() to anon, authenticated;

-- ---------- storage bucket for uploads ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- public read (bucket is public anyway; belt & suspenders)
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ---------- new settings keys ----------
insert into public.site_settings (key, value) values
  ('ads', '{"enabled": false, "home_top": "", "home_bottom": "", "product_page": "", "popup": ""}'::jsonb),
  ('notifications', '{"onesignal_app_id": ""}'::jsonb)
on conflict (key) do nothing;

-- allow public read of ads + notifications settings
drop policy if exists "public read store settings" on public.site_settings;
create policy "public read store settings" on public.site_settings
  for select using (key in ('payment_numbers','store','ads','notifications'));

-- ---------- seed slides ----------
insert into public.slides (title_bn, subtitle_bn, cta_text, cta_link, bg_from, bg_to, sort) values
  ('CapCut Pro — ভিডিও এডিটিংয়ের রাজা', 'ওয়াটারমার্ক ছাড়া 4K এক্সপোর্ট, সব প্রিমিয়াম ইফেক্ট এখন হাতের মুঠোয়', 'অর্ডার করুন', '/product/capcut-pro', '#7c3aed', '#d7ff3f', 1),
  ('Canva Pro — ডিজাইন হবে প্রো লেভেল', '৬ লাখ+ প্রিমিয়াম টেমপ্লেট ও AI টুলস এক সাবস্ক্রিপশনে', 'দেখুন', '/product/canva-pro', '#0ea5e9', '#8b5cf6', 2),
  ('YouTube Premium — বিজ্ঞাপনমুক্ত দুনিয়া', 'ব্যাকগ্রাউন্ড প্লে + YouTube Music সহ ফুল প্যাকেজ', 'কিনুন', '/product/youtube-premium', '#ef4444', '#f59e0b', 3)
on conflict do nothing;
