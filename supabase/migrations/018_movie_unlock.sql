-- ============================================================
-- DigiPlyra — 018: movie unlock system
-- 10-ad click gate + per-movie multiple watch/download links
-- Run in Supabase SQL Editor.
-- ============================================================

alter table public.movies
  add column if not exists watch_links jsonb not null default '[]';
alter table public.movies
  add column if not exists download_links jsonb not null default '[]';

insert into public.site_settings (key, value)
values ('movie_unlock', '{"ad_count":10,"ad_links":["https://uplcm.com/4/12056944"]}'::jsonb)
on conflict (key) do nothing;

-- allow public (anon) read of the unlock config
drop policy if exists "public read store settings" on public.site_settings;
create policy "public read store settings" on public.site_settings
  for select using (key in ('payment_numbers', 'store', 'ads', 'rewards', 'movie_unlock'));
