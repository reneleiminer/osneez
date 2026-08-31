-- Vorbedingung: bricht mit einer lesbaren Meldung ab, wenn eine
-- vorherige Migration fehlt, statt mit einem rohen 42P01-Fehler.
do $guard$
begin
  if to_regclass('public.settings') is null then
    raise exception 'Zuerst % ausfuehren.', '0003_settings_and_legal.sql';
  end if;
end
$guard$;

-- =============================================================================
-- OSNEEZ — transactional email and carrier settings
--
-- Note on credentials: API keys and SMTP passwords are NOT stored here. The
-- settings table is readable by anonymous visitors (imprint data, shipping
-- terms), so every secret lives in an environment variable instead. This table
-- only holds the non-sensitive configuration.
-- =============================================================================

alter table public.settings
  add column if not exists email_from text,
  add column if not exists email_from_name text,
  add column if not exists email_reply_to text,
  add column if not exists email_order_confirmation boolean not null default true,
  add column if not exists email_shipping_notification boolean not null default true,
  add column if not exists email_return_updates boolean not null default true,
  add column if not exists carrier_default text,
  add column if not exists parcel_weight_g integer not null default 500;

-- Delivery log --------------------------------------------------------------
-- One row per attempted send, so a failed order confirmation is visible in the
-- admin instead of disappearing into the server log.
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  template text not null,
  to_email text not null,
  subject text not null,
  order_id uuid references public.orders (id) on delete set null,
  provider text,
  status text not null default 'sent' check (status in ('sent', 'failed', 'skipped')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists email_log_order_idx on public.email_log (order_id);
create index if not exists email_log_template_idx on public.email_log (template, created_at desc);

-- Written and read exclusively by the service role.
alter table public.email_log enable row level security;
