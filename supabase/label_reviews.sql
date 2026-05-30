create table if not exists public.label_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  product_name text not null,
  categories text[] not null default '{}',
  tier text not null default 'free',
  status text not null default 'reviewed',
  amount integer not null default 0,
  metadata jsonb not null default '{}',
  ingredients jsonb not null default '[]',
  results jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.label_reviews enable row level security;

drop policy if exists "Users can insert own label reviews" on public.label_reviews;
create policy "Users can insert own label reviews"
on public.label_reviews
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own label reviews" on public.label_reviews;
create policy "Users can read own label reviews"
on public.label_reviews
for select
to authenticated
using (auth.uid() = user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  order_id text not null,
  payment_key text,
  amount integer not null,
  tier text not null,
  product_name text,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

drop policy if exists "Users can insert own payments" on public.payments;
create policy "Users can insert own payments"
on public.payments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
on public.payments
for select
to authenticated
using (auth.uid() = user_id);
