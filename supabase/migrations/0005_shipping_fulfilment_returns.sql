-- =============================================================================
-- OSNEEZ — shipping zones, fulfilment tracking and returns
-- =============================================================================

-- Shipping zones --------------------------------------------------------------
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  countries text[] not null default array[]::text[],
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.shipping_zones;
create trigger set_updated_at before update on public.shipping_zones
  for each row execute function public.set_updated_at();

-- Rates within a zone. Amounts in cents.
create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.shipping_zones (id) on delete cascade,
  name text not null,
  description text,
  price integer not null default 0 check (price >= 0),
  -- Order value from which this rate becomes free. Null = never free.
  free_over integer check (free_over >= 0),
  -- Rate is only offered inside this order-value window.
  min_subtotal integer check (min_subtotal >= 0),
  max_subtotal integer check (max_subtotal >= 0),
  delivery_min_days integer not null default 2 check (delivery_min_days >= 0),
  delivery_max_days integer not null default 5 check (delivery_max_days >= 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipping_rates_zone_idx
  on public.shipping_rates (zone_id, sort_order);

drop trigger if exists set_updated_at on public.shipping_rates;
create trigger set_updated_at before update on public.shipping_rates
  for each row execute function public.set_updated_at();

-- Seed one zone per country group already configured in settings, so the shop
-- keeps behaving exactly as before until the zones are edited.
insert into public.shipping_zones (name, countries, sort_order)
select 'Deutschland', array['DE'], 1
where not exists (select 1 from public.shipping_zones);

insert into public.shipping_zones (name, countries, sort_order)
select 'EU', array['AT','BE','CH','CZ','DK','ES','FI','FR','IT','LU','NL','PL','PT','SE'], 2
where not exists (
  select 1 from public.shipping_zones where name = 'EU'
);

insert into public.shipping_rates (zone_id, name, price, free_over, delivery_min_days, delivery_max_days)
select z.id, 'Standard', 490, 12000, 2, 5
from public.shipping_zones z
where z.name = 'Deutschland'
  and not exists (select 1 from public.shipping_rates r where r.zone_id = z.id);

insert into public.shipping_rates (zone_id, name, price, free_over, delivery_min_days, delivery_max_days)
select z.id, 'Standard EU', 990, 15000, 3, 7
from public.shipping_zones z
where z.name = 'EU'
  and not exists (select 1 from public.shipping_rates r where r.zone_id = z.id);

-- Fulfilment ------------------------------------------------------------------
alter table public.orders add column if not exists carrier text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists tracking_url text;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists internal_note text;

-- Returns ---------------------------------------------------------------------
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  order_reference text,
  email text not null,
  reason text,
  items text,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'received', 'refunded', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists return_requests_email_idx
  on public.return_requests (lower(email));

drop trigger if exists set_updated_at on public.return_requests;
create trigger set_updated_at before update on public.return_requests
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row level security
-- =============================================================================

alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.return_requests enable row level security;

-- Rates have to be readable: the cart shows the price before checkout.
drop policy if exists "public read active zones" on public.shipping_zones;
create policy "public read active zones"
  on public.shipping_zones for select
  to anon, authenticated
  using (active);

drop policy if exists "public read active rates" on public.shipping_rates;
create policy "public read active rates"
  on public.shipping_rates for select
  to anon, authenticated
  using (
    active
    and exists (
      select 1 from public.shipping_zones z
      where z.id = zone_id and z.active
    )
  );

-- Customers may raise a return for their own address and read their own
-- requests. Status changes stay with the service role.
drop policy if exists "customers read own returns" on public.return_requests;
create policy "customers read own returns"
  on public.return_requests for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "customers create own returns" on public.return_requests;
create policy "customers create own returns"
  on public.return_requests for insert
  to authenticated
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
