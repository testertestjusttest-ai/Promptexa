-- DigiPlyra — user deposits (add funds to wallet via bkash/nagad/rocket/card)
-- Run AFTER 011. User runs this in Supabase SQL editor.

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_bdt numeric(12,2) not null,
  method text not null, -- bkash | nagad | rocket | card
  trx_id text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists deposits_status_idx on public.deposits(status, created_at desc);
create index if not exists deposits_user_idx on public.deposits(user_id, created_at desc);

alter table public.deposits enable row level security;

-- users can read their own deposits
create policy "read own deposits" on public.deposits
  for select using (auth.uid() = user_id);

-- users can insert their own deposit requests
create policy "insert own deposits" on public.deposits
  for insert with check (auth.uid() = user_id);

-- ---------- atomic wallet credit (used when admin approves a deposit) ----------
create or replace function public.wallet_credit(p_user_id uuid, p_amount numeric, p_label text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles set wallet_bdt = coalesce(wallet_bdt, 0) + p_amount
  where id = p_user_id;
  insert into public.wallet_txns (user_id, amount_bdt, label)
  values (p_user_id, p_amount, p_label);
end;
$$;
