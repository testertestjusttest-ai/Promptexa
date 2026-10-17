-- ============================================================
-- DigiPlyra — 019: movie quality badge (WEB-DL / HDTC ...)
-- Run in Supabase SQL Editor.
-- ============================================================

alter table public.movies
  add column if not exists quality text;
