-- DigiPlyra — multi-tenant client sites (demo → client handover with custom domains)
-- Run AFTER 012. User runs this in Supabase SQL editor.

create table if not exists public.client_sites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- url: /c/{slug}
  demo_slug text not null,                 -- base demo, e.g. "fashion"
  site_title text not null,                -- client site name
  client_name text,
  contact text,
  theme text,                              -- aurora|split|minimal|bold|elegant|playful
  accent text,                             -- hex color
  logo_emoji text,
  hero_title text,
  hero_sub text,
  custom_domain text unique,               -- e.g. "shop.rahim.com" (nullable)
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists client_sites_domain_idx on public.client_sites(custom_domain);
create index if not exists client_sites_slug_idx on public.client_sites(slug);

alter table public.client_sites enable row level security;

-- public read: anyone can view active client sites (they're public websites)
create policy "public read active client sites" on public.client_sites
  for select using (is_active = true);

-- only service role (admin API) can insert/update/delete → no insert/update/delete policies
