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
  ('১০০ ডায়মন্ড', 'diamond', 100, 0, 130, null, null, 3),
  ('১১৫ ডায়মন্ড', 'diamond', 115, 0, 155, null, '🔥 জনপ্রিয়', 4),
  ('২০০ ডায়মন্ড', 'diamond', 200, 0, 260, null, null, 5),
  ('২১০ ডায়মন্ড', 'diamond', 210, 0, 275, null, null, 6),
  ('৩১০ ডায়মন্ড', 'diamond', 310, 0, 390, null, '⭐ জনপ্রিয়', 7),
  ('৩৪০ ডায়মন্ড', 'diamond', 340, 0, 430, null, null, 8),
  ('৫০০ ডায়মন্ড', 'diamond', 500, 0, 610, null, null, 9),
  ('৫২০ ডায়মন্ড', 'diamond', 520, 0, 640, 700, null, 10),
  ('৬৯০ ডায়মন্ড', 'diamond', 690, 0, 840, null, null, 11),
  ('১০০০ ডায়মন্ড', 'diamond', 1000, 0, 1180, null, null, 12),
  ('১০৬০ ডায়মন্ড', 'diamond', 1060, 0, 1240, 1350, '⭐ বেস্ট ভ্যালু', 13),
  ('১৫০০ ডায়মন্ড', 'diamond', 1500, 0, 1760, null, null, 14),
  ('২০০০ ডায়মন্ড', 'diamond', 2000, 0, 2300, null, null, 15),
  ('২১৮০ ডায়মন্ড', 'diamond', 2180, 0, 2480, 2650, null, 16),
  ('৩০০০ ডায়মন্ড', 'diamond', 3000, 0, 3400, null, null, 17),
  ('৫০০০ ডায়মন্ড', 'diamond', 5000, 0, 5600, null, null, 18),
  ('৫৬০০ ডায়মন্ড', 'diamond', 5600, 0, 6200, 6600, '💰 হোলসেল', 19),
  ('Weekly Lite Membership', 'membership', 0, 0, 55, null, null, 20),
  ('Weekly Membership', 'membership', 0, 0, 170, null, '💰 সাশ্রয়ী', 21),
  ('Monthly Membership', 'membership', 0, 0, 780, 850, null, 22),
  ('Level Up Pass', 'membership', 0, 0, 190, null, '🆕 নতুন', 23),
  ('৩১০ ডায়মন্ড + Weekly কম্বো', 'diamond', 310, 0, 540, 580, '🎁 কম্বো অফার', 24),
  ('স্পেশাল এয়ারড্রপ প্যাক', 'diamond', 100, 25, 99, 130, '🆕 নতুন অফার', 25);
