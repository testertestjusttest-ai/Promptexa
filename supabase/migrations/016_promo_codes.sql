-- 016: promo codes for promoter-driven discounts
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                       -- normalized UPPERCASE, e.g. RAKIB20
  label_bn text,                                   -- promoter name / note, e.g. "রাকিব ভাই"
  discount_percent int not null check (discount_percent >= 1 and discount_percent <= 90),
  max_uses int check (max_uses is null or max_uses > 0),
  used_count int not null default 0,
  min_order_bdt int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists promo_codes_code_idx on public.promo_codes(code);

alter table public.orders add column if not exists promo_code text;
alter table public.orders add column if not exists discount_bdt int not null default 0;

-- atomic promo usage increment (race-safe; no-op once max_uses is reached)
create or replace function public.promo_consume(p_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.promo_codes
  set used_count = used_count + 1
  where id = p_id
    and (max_uses is null or used_count < max_uses);
end $$;
