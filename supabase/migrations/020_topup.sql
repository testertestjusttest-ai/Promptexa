-- Free Fire diamond top-up store
create table if not exists public.topup_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'diamond',
  diamonds int not null default 0,
  bonus int not null default 0,
  price_bdt numeric(10,2) not null,
  old_price_bdt numeric(10,2),
  badge text,
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.topup_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  player_uid text not null,
  phone text not null,
  package_id uuid references public.topup_packages(id) on delete set null,
  package_name text not null,
  diamonds int not null default 0,
  price_bdt numeric(10,2) not null,
  payment_method text not null,
  sender_number text not null,
  trx_id text not null,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now()
);

alter table public.topup_packages enable row level security;
alter table public.topup_orders enable row level security;

drop policy if exists "topup_packages_public_read" on public.topup_packages;
create policy "topup_packages_public_read" on public.topup_packages
  for select using (is_active = true);

-- topup_orders: no anon policies; all reads/writes go through service-role API routes

-- seed packages (runs once)
insert into public.topup_packages (name, kind, diamonds, bonus, price_bdt, old_price_bdt, badge, sort) values
  ('২৫ ডায়মন্ড', 'diamond', 25, 0, 40, null, null, 1),
  ('৫০ ডায়মন্ড', 'diamond', 50, 0, 75, null, null, 2),
  ('১১৫ ডায়মন্ড', 'diamond', 115, 0, 155, null, '🔥 জনপ্রিয়', 3),
  ('২৪০ ডায়মন্ড', 'diamond', 240, 0, 305, null, null, 4),
  ('৫০৫ ডায়মন্ড', 'diamond', 505, 0, 620, 680, null, 5),
  ('১০৬০ ডায়মন্ড', 'diamond', 1060, 0, 1240, 1350, '⭐ বেস্ট ভ্যালু', 6),
  ('Weekly Membership', 'membership', 0, 0, 170, null, '💰 সাশ্রয়ী', 7),
  ('Monthly Membership', 'membership', 0, 0, 780, 850, null, 8);
