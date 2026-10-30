-- Pakka database
-- Paste this whole file into Supabase -> SQL Editor -> New query, then press "Run".
-- It is safe to run more than once.

-- 1. ORDERS ---------------------------------------------------------------
-- One row per order. "user_id" is the seller who owns it, filled in automatically.
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_name     text not null check (char_length(customer_name) between 1 and 100),
  phone             text not null check (phone ~ '^92[0-9]{10}$'),   -- e.g. 923001234567
  city              text not null default '',
  address           text not null default '',
  items             text not null check (char_length(items) between 1 and 500),
  amount            integer not null check (amount > 0),              -- rupees
  status            text not null default 'waiting'
                    check (status in ('waiting','confirmed','cancelled','shipped','delivered','refused')),
  messages_sent     integer not null default 0,                       -- confirmations + reminders tapped
  last_message_at   timestamptz,
  status_changed_at timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_user_phone_idx   on public.orders (user_id, phone);

-- Row Level Security: every seller can only see and change their OWN orders.
alter table public.orders enable row level security;

drop policy if exists "orders: read own"   on public.orders;
drop policy if exists "orders: add own"    on public.orders;
drop policy if exists "orders: change own" on public.orders;
drop policy if exists "orders: delete own" on public.orders;

create policy "orders: read own"   on public.orders for select to authenticated
  using (user_id = (select auth.uid()));
create policy "orders: add own"    on public.orders for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "orders: change own" on public.orders for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "orders: delete own" on public.orders for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.orders to authenticated;

-- 2. CUSTOMER REFUSALS ----------------------------------------------------
-- How many times each WhatsApp number refused an order (all time).
-- "security_invoker" makes the view obey the rules above, so sellers only count their own orders.
create or replace view public.customer_refusals
with (security_invoker = true) as
  select phone, count(*)::int as refused
  from public.orders
  where status = 'refused'
  group by user_id, phone;

grant select on public.customer_refusals to authenticated;

-- 3. SHOP SETTINGS --------------------------------------------------------
-- One row per seller: shop name and the language of customer messages.
create table if not exists public.shops (
  user_id       uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  shop_name     text not null default '' check (char_length(shop_name) <= 60),
  message_lang  text not null default 'ur' check (message_lang in ('ur','en')),
  updated_at    timestamptz not null default now()
);

alter table public.shops enable row level security;

drop policy if exists "shops: read own"   on public.shops;
drop policy if exists "shops: add own"    on public.shops;
drop policy if exists "shops: change own" on public.shops;

create policy "shops: read own"   on public.shops for select to authenticated
  using (user_id = (select auth.uid()));
create policy "shops: add own"    on public.shops for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "shops: change own" on public.shops for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update on public.shops to authenticated;
