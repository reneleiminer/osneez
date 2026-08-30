-- =============================================================================
-- OSNEEZ — shop schema
-- Run in the Supabase SQL editor or via `supabase db push`.
-- =============================================================================

create extension if not exists "pgcrypto";

-- Shared updated_at trigger -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Collections ---------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  cover_image text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Drops ---------------------------------------------------------------------
create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  release_date timestamptz,
  hero_image text,
  hero_video text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products ------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  description text,
  material text,
  fit text,
  details text,
  -- Gross price in cents (EUR, VAT inclusive).
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  active boolean not null default true,
  featured boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'coming_soon', 'sold_out', 'archived')),
  category text not null
    check (category in ('tees', 'hoodies', 'zipper', 'bottoms', 'accessories')),
  collection_id uuid references public.collections (id) on delete set null,
  drop_id uuid references public.drops (id) on delete set null,
  badge text check (badge in ('NEW', 'LIMITED', 'RESTOCK', 'SOLD OUT', 'UPCOMING')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_collection_idx on public.products (collection_id);
create index if not exists products_drop_idx on public.products (drop_id);
create index if not exists products_active_idx on public.products (active, status);

-- Variants ------------------------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  size text not null,
  color text not null,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id);

-- Images --------------------------------------------------------------------
-- image_url holds a public Storage URL. Never store base64 payloads here.
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  type text not null default 'front'
    check (type in ('front', 'back', 'detail', 'lifestyle')),
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, sort_order);

-- World stories -------------------------------------------------------------
create table if not exists public.world_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text not null default '',
  timestamp_label text not null default '',
  excerpt text not null default '',
  body text,
  cover_image text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Newsletter ----------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'site',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders --------------------------------------------------------------------
-- Written exclusively by the Stripe webhook using the service role key.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_payment_intent text,
  email text,
  customer_name text,
  amount_total integer not null default 0,
  amount_subtotal integer not null default 0,
  currency text not null default 'eur',
  payment_status text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'fulfilled')),
  shipping_details jsonb,
  line_items jsonb,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_status_idx on public.orders (status);

-- updated_at triggers -------------------------------------------------------
do $$
declare
  target text;
begin
  foreach target in array array[
    'collections', 'drops', 'products', 'product_variants',
    'world_stories', 'newsletter_subscribers', 'orders'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      target, target
    );
  end loop;
end;
$$;

-- =============================================================================
-- Row level security
-- Anonymous visitors may read published catalogue data and nothing else.
-- Every write path (orders, newsletter, stock) runs server-side with the
-- service role key, which bypasses RLS.
-- =============================================================================

alter table public.collections enable row level security;
alter table public.drops enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.world_stories enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public read active collections" on public.collections;
create policy "public read active collections"
  on public.collections for select
  to anon, authenticated
  using (active);

drop policy if exists "public read active drops" on public.drops;
create policy "public read active drops"
  on public.drops for select
  to anon, authenticated
  using (active);

drop policy if exists "public read active products" on public.products;
create policy "public read active products"
  on public.products for select
  to anon, authenticated
  using (active and status <> 'archived');

drop policy if exists "public read variants of active products" on public.product_variants;
create policy "public read variants of active products"
  on public.product_variants for select
  to anon, authenticated
  using (
    active
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.active and p.status <> 'archived'
    )
  );

drop policy if exists "public read images of active products" on public.product_images;
create policy "public read images of active products"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.active and p.status <> 'archived'
    )
  );

drop policy if exists "public read world stories" on public.world_stories;
create policy "public read world stories"
  on public.world_stories for select
  to anon, authenticated
  using (published_at <= now());

-- No anon/authenticated policies exist for newsletter_subscribers or orders,
-- so with RLS enabled every client-side read and write is denied by default.

-- =============================================================================
-- Storage buckets (public read, service-role write)
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('collections', 'collections', true),
  ('campaigns', 'campaigns', true),
  ('world', 'world', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read brand media" on storage.objects;
create policy "public read brand media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('products', 'collections', 'campaigns', 'world'));
