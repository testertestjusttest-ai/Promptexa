-- ============================================================
-- DigiPlyra v5.5 — user-to-user DM chat (community chat)
-- Run AFTER 010_ad_rounds.sql
-- ============================================================

-- ---------- DM threads (canonical user_a < user_b ordering) ----------
create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_msg_at timestamptz not null default now(),
  constraint dm_threads_order check (user_a < user_b),
  constraint dm_threads_pair unique (user_a, user_b)
);
create index if not exists dm_threads_user_a_idx on public.dm_threads(user_a);
create index if not exists dm_threads_user_b_idx on public.dm_threads(user_b);
create index if not exists dm_threads_last_msg_idx on public.dm_threads(last_msg_at desc);

-- ---------- DM messages ----------
create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists dm_messages_thread_idx on public.dm_messages(thread_id, created_at);

-- RLS on; all access goes through API routes with the service-role client
-- (same pattern as listing_messages).
alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;

-- ---------- public read for the community_chat setting ----------
drop policy if exists "public read store settings" on public.site_settings;
create policy "public read store settings" on public.site_settings
  for select using (key in ('payment_numbers', 'store', 'ads', 'rewards', 'community_chat'));

-- default: enabled
insert into public.site_settings (key, value)
values ('community_chat', '{"enabled": true}'::jsonb)
on conflict (key) do nothing;
