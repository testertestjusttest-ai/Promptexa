-- 015: Cloudflare R2 backing for large product files.
-- product_files.storage: 'supabase' (default, existing rows) or 'r2' (new large uploads).
alter table public.product_files
  add column if not exists storage text not null default 'supabase';
