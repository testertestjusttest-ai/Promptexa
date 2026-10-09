-- 010: hourly ad rounds — 20 cards per round, lump-sum ৳20 on completion
-- Each card watch marks the card done (no per-card payout).
-- Completing all 20 unlocks a one-time ৳20 round bonus claim.

create table if not exists public.ad_rounds (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  round_start timestamptz not null default now(),
  cards_done int[] not null default '{}',
  claimed boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.ad_rounds enable row level security;
drop policy if exists "ad_rounds_owner" on public.ad_rounds;
create policy "ad_rounds_owner" on public.ad_rounds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
