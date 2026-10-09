-- ============================================================
-- DigiPlyra v4 — wallet, reward ads, referrals, withdrawals,
-- service (website-order) products
-- Run AFTER 003_file_delivery.sql
-- ============================================================

-- ---------- product type: key | file | service ----------
alter table public.products
  add column if not exists product_type text not null default 'key'
  check (product_type in ('key', 'file', 'service'));

-- ---------- orders: wallet payments + service orders ----------
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending','payment_pending','paid','delivered','cancelled','refunded','keys_pending','service_pending'));

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('sslcommerz','bkash','nagad','rocket','wallet'));

-- payments table method check (if it has one)
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'payments_method_check') then
    alter table public.payments drop constraint payments_method_check;
  end if;
exception when others then null;
end $$;

-- ---------- referrals on profiles ----------
alter table public.profiles
  add column if not exists referral_code text unique;
alter table public.profiles
  add column if not exists referred_by uuid references public.profiles(id) on delete set null;

create or replace function public.gen_referral_code() returns text
language sql as $$
  select upper(substring(md5(gen_random_uuid()::text) from 1 for 8));
$$;

-- backfill codes for existing users
update public.profiles
set referral_code = public.gen_referral_code()
where referral_code is null;

-- ---------- wallets ----------
create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_bdt numeric(12,2) not null default 0,
  total_earned_bdt numeric(12,2) not null default 0,
  total_spent_bdt numeric(12,2) not null default 0,
  total_withdrawn_bdt numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_bdt numeric(12,2) not null,
  type text not null, -- ad_reward | referral_bonus | purchase | withdrawal | refund | adjustment
  note text,
  ref_id text,
  created_at timestamptz not null default now()
);
create index if not exists wallet_txns_user_idx on public.wallet_transactions(user_id, created_at desc);

-- ---------- withdrawals ----------
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_bdt numeric(12,2) not null,
  method text not null, -- bkash | nagad | rocket
  account_number text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists withdrawals_status_idx on public.withdrawals(status, created_at desc);
create index if not exists withdrawals_user_idx on public.withdrawals(user_id, created_at desc);

-- ---------- referrals ledger ----------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade unique,
  bonus_bdt numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on public.referrals(referrer_id);

-- ---------- ad view log (server-side rate limiting) ----------
create table if not exists public.ad_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists ad_views_user_idx on public.ad_views(user_id, created_at desc);

-- ---------- RPC: claim one ad reward (atomic: cooldown + daily cap + credit) ----------
create or replace function public.claim_ad_reward(
  p_user uuid, p_amount numeric, p_cooldown_sec int, p_daily_limit int
) returns jsonb
language plpgsql security definer as $$
declare
  v_last timestamptz;
  v_today int;
  v_wait int;
begin
  select max(created_at) into v_last from public.ad_views where user_id = p_user;
  if v_last is not null then
    v_wait := p_cooldown_sec - floor(extract(epoch from (now() - v_last)))::int;
    if v_wait > 0 then
      return jsonb_build_object('ok', false, 'error', 'cooldown', 'wait_sec', v_wait);
    end if;
  end if;

  select count(*) into v_today
  from public.ad_views
  where user_id = p_user and created_at > date_trunc('day', now());
  if v_today >= p_daily_limit then
    return jsonb_build_object('ok', false, 'error', 'daily_limit');
  end if;

  insert into public.ad_views(user_id) values (p_user);

  insert into public.wallets(user_id, balance_bdt, total_earned_bdt)
    values (p_user, p_amount, p_amount)
    on conflict (user_id) do update set
      balance_bdt = public.wallets.balance_bdt + excluded.balance_bdt,
      total_earned_bdt = public.wallets.total_earned_bdt + excluded.total_earned_bdt,
      updated_at = now();

  insert into public.wallet_transactions(user_id, amount_bdt, type, note)
    values (p_user, p_amount, 'ad_reward', 'রিওয়ার্ড অ্যাড দেখার বোনাস');

  return jsonb_build_object('ok', true, 'amount', p_amount);
end $$;

-- ---------- RPC: spend from wallet (atomic balance check + debit) ----------
create or replace function public.wallet_spend(
  p_user uuid, p_amount numeric, p_note text, p_ref text
) returns jsonb
language plpgsql security definer as $$
declare
  v_bal numeric(12,2);
begin
  insert into public.wallets(user_id) values (p_user) on conflict (user_id) do nothing;

  select balance_bdt into v_bal from public.wallets where user_id = p_user for update;
  if v_bal is null or v_bal < p_amount then
    return jsonb_build_object('ok', false, 'error', 'insufficient');
  end if;

  update public.wallets set
    balance_bdt = balance_bdt - p_amount,
    total_spent_bdt = total_spent_bdt + p_amount,
    updated_at = now()
  where user_id = p_user;

  insert into public.wallet_transactions(user_id, amount_bdt, type, note, ref_id)
    values (p_user, -p_amount, 'purchase', p_note, p_ref);

  return jsonb_build_object('ok', true);
end $$;

-- ---------- default rewards settings ----------
insert into public.site_settings(key, value) values ('rewards', '{
  "enabled": true,
  "ad_reward_bdt": 2,
  "ad_cooldown_sec": 60,
  "ad_daily_limit": 20,
  "referral_bonus_bdt": 20,
  "min_withdraw_bdt": 500,
  "reward_ad_code": ""
}'::jsonb)
on conflict (key) do nothing;

-- ---------- RLS ----------
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.referrals enable row level security;
alter table public.ad_views enable row level security;

create policy "own wallet read" on public.wallets
  for select using (user_id = auth.uid());

create policy "own txns read" on public.wallet_transactions
  for select using (user_id = auth.uid());

create policy "own withdrawals read" on public.withdrawals
  for select using (user_id = auth.uid());

create policy "own referral read" on public.referrals
  for select using (referrer_id = auth.uid() or referred_id = auth.uid());
