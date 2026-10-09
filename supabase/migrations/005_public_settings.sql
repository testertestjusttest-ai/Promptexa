-- ============================================================
-- DigiPlyra v4.1 — public read for ads + rewards settings
-- (The v1 policy only allowed 'payment_numbers' and 'store',
--  so the Earn page could never see the rewards config and
--  always showed "reward system disabled".)
-- Run AFTER 004_wallet_rewards.sql
-- ============================================================

drop policy if exists "public read store settings" on public.site_settings;

create policy "public read store settings" on public.site_settings
  for select using (key in ('payment_numbers', 'store', 'ads', 'rewards'));
