-- =============================================================================
-- OSNEEZ — company settings and editable legal pages
-- Moves everything that was hard-coded in src/lib/site.ts into the database
-- so it can be maintained from /admin/settings.
-- =============================================================================

-- Single-row settings table. The check constraint keeps it a singleton.
create table if not exists public.settings (
  id text primary key default 'default' check (id = 'default'),

  -- Company / legal entity ---------------------------------------------------
  legal_name text,
  legal_form text,
  street text,
  postal_code text,
  city text,
  country text default 'Deutschland',
  representative text,
  register_court text,
  register_number text,
  vat_id text,
  small_business boolean not null default false,
  responsible_person text,

  -- Contact ------------------------------------------------------------------
  contact_email text,
  support_email text,
  press_email text,
  phone text,

  -- Brand / storefront -------------------------------------------------------
  announcements text[] not null default array[
    'FREE SHIPPING DE FROM €120',
    'DROP 001 — AVAILABLE NOW',
    'SHIPPED WITHIN 48H'
  ],
  instagram_url text,
  tiktok_url text,
  hero_video_url text,
  hero_image_url text,

  -- Shipping -----------------------------------------------------------------
  -- Amounts in cents.
  free_shipping_threshold integer not null default 12000
    check (free_shipping_threshold >= 0),
  shipping_rate integer not null default 490 check (shipping_rate >= 0),
  shipping_countries text[] not null default array[
    'AT','BE','CH','CZ','DE','DK','ES','FI','FR','IT','LU','NL','PL','PT','SE'
  ],
  delivery_min_days integer not null default 2 check (delivery_min_days >= 0),
  delivery_max_days integer not null default 5 check (delivery_max_days >= 0),

  -- Payments -----------------------------------------------------------------
  -- Empty array = let Stripe decide based on the dashboard configuration,
  -- which is the recommended setup.
  payment_methods text[] not null default array[]::text[],
  automatic_tax boolean not null default true,
  promotion_codes boolean not null default true,
  invoice_creation boolean not null default true,

  updated_at timestamptz not null default now()
);

insert into public.settings (id) values ('default') on conflict (id) do nothing;

drop trigger if exists set_updated_at on public.settings;
create trigger set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- Editable legal / service pages ---------------------------------------------
-- body is plain text; lines starting with "## " become section headings.
-- {{tokens}} are replaced with the matching settings field at render time.
create table if not exists public.legal_pages (
  slug text primary key
    check (slug in ('imprint', 'privacy', 'terms', 'returns', 'shipping')),
  title text not null,
  intro text,
  body text not null default '',
  draft boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.legal_pages;
create trigger set_updated_at before update on public.legal_pages
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row level security
-- Both tables hold information that is public by nature (imprint data, shipping
-- terms). Anonymous visitors may read, nobody may write except the service role.
-- =============================================================================

alter table public.settings enable row level security;
alter table public.legal_pages enable row level security;

drop policy if exists "public read settings" on public.settings;
create policy "public read settings"
  on public.settings for select
  to anon, authenticated
  using (true);

drop policy if exists "public read legal pages" on public.legal_pages;
create policy "public read legal pages"
  on public.legal_pages for select
  to anon, authenticated
  using (true);
