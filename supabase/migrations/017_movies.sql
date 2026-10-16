-- 017: movie pages (watch + download, ad-gated steps)
-- Note: video/download URLs point to EXTERNAL hosts chosen by the admin.
-- This site only stores metadata + links, never the video files themselves.
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  poster_url text,
  description text,
  year int,
  genre text,
  video_url text,        -- watch: direct file or embed URL on external host
  download_url text,     -- final download link on external host
  is_active boolean not null default true,
  is_featured boolean not null default false,
  views int not null default 0,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists movies_slug_idx on public.movies(slug);
create index if not exists movies_active_idx on public.movies(is_active, sort);

-- RLS: public can read active movies (admin uses service key, bypasses RLS)
alter table public.movies enable row level security;
drop policy if exists "public read movies" on public.movies;
create policy "public read movies"
  on public.movies for select
  using (is_active = true);
