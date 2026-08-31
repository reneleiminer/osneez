-- =============================================================================
-- OSNEEZ — discounts, customer accounts and staff roles
-- =============================================================================

-- Discounts -------------------------------------------------------------------
-- Mirror of a Stripe coupon + promotion code. Stripe stays the source of truth
-- for redemption; this table exists so the codes are manageable from /admin.
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  kind text not null default 'percent' check (kind in ('percent', 'amount')),
  -- percent: 1–100. amount: cents.
  value integer not null check (value > 0),
  min_subtotal integer check (min_subtotal >= 0),
  max_redemptions integer check (max_redemptions > 0),
  expires_at timestamptz,
  active boolean not null default true,
  stripe_coupon_id text,
  stripe_promotion_code_id text,
  times_redeemed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.discounts;
create trigger set_updated_at before update on public.discounts
  for each row execute function public.set_updated_at();

-- Staff -----------------------------------------------------------------------
-- Roles for the backoffice. ADMIN_EMAILS stays as an owner-level bootstrap so
-- nobody can lock themselves out of their own shop.
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null default 'editor'
    check (role in ('owner', 'editor', 'fulfilment')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.staff;
create trigger set_updated_at before update on public.staff
  for each row execute function public.set_updated_at();

-- Customer profiles -----------------------------------------------------------
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.customer_profiles;
create trigger set_updated_at before update on public.customer_profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row level security
-- =============================================================================

alter table public.discounts enable row level security;
alter table public.staff enable row level security;
alter table public.customer_profiles enable row level security;

-- discounts and staff: no policies at all. Every read and write goes through
-- the service role, so codes cannot be enumerated from the browser.

drop policy if exists "customers manage own profile" on public.customer_profiles;
create policy "customers manage own profile"
  on public.customer_profiles for all
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Signed-in customers may read their own orders, matched on the email Stripe
-- collected at checkout. Still no insert/update/delete for anyone but the
-- service role.
drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
  on public.orders for select
  to authenticated
  using (
    email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create index if not exists orders_email_lower_idx
  on public.orders (lower(email));
