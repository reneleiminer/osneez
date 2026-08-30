-- =============================================================================
-- OSNEEZ — demo catalogue
-- Mirrors src/lib/shop/seed.ts so the database matches what the storefront
-- shows before Supabase is populated. OPTIONAL: skip this file entirely once
-- real product data exists, or run it and edit the rows in the dashboard.
-- Safe to re-run (upserts on slug / sku).
-- =============================================================================

insert into public.collections (slug, name, description, active, sort_order) values
  ('afterdark', 'AFTERDARK', 'The core line. Heavy cotton, washed blacks, cuts that survive a night on the bike.', true, 1),
  ('motor-division', 'MOTOR DIVISION', 'Racing-derived graphics and technical detailing. Built with riders, tested on the road.', true, 2),
  ('essentials', 'ESSENTIALS', 'Quiet pieces. Blank canvas, heavyweight base layers, everyday hardware.', true, 3)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.drops (slug, name, tagline, description, release_date, active) values
  ('drop-001', 'DROP 001', 'BUILT AFTER DARK.', 'Ten pieces made for the hours nobody talks about. Cut heavy, washed down, produced in a run small enough to sell out.', '2026-02-14T19:00:00Z', true),
  ('drop-002', 'DROP 002', 'MOTOR DIVISION.', 'Technical layers, riding-first patterning and the first OSNEEZ pieces designed on a bike instead of a mannequin.', '2026-09-26T19:00:00Z', true)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  release_date = excluded.release_date;

-- Products ------------------------------------------------------------------
insert into public.products (
  slug, name, subtitle, description, material, fit, details,
  price, compare_at_price, featured, status, category, badge,
  collection_id, drop_id
)
select
  seed.slug, seed.name, seed.subtitle, seed.description, seed.material, seed.fit, seed.details,
  seed.price, seed.compare_at_price, seed.featured, seed.status, seed.category, seed.badge,
  c.id, d.id
from (values
  ('afterdark-tee', 'Afterdark Tee', 'Washed Black',
   'The piece the whole drop is built around. Garment-dyed heavyweight jersey with a boxy body, dropped shoulder and a print that only reads properly under streetlight.',
   '100% organic cotton, 240 gsm, garment dyed.', 'Boxy, true to size. Take one down for a clean fit.',
   'Ribbed collar, double-stitched hem, screen print front and back.',
   5500, null::integer, true, 'active', 'tees', 'NEW', 'afterdark', 'drop-001'),
  ('velocity-tee', 'Velocity Tee', 'Bone',
   'Motion-blur graphic pulled from a night run through the city. Off-white body, oversized back print, small chest hit.',
   '100% cotton, 220 gsm.', 'Relaxed, slightly longer body.',
   'Water-based print, no plastisol. Softens with every wash.',
   5500, null, true, 'active', 'tees', null, 'motor-division', 'drop-001'),
  ('night-shift-longsleeve', 'Night Shift Longsleeve', 'Asphalt',
   'Long sleeve base layer with typography running from cuff to shoulder. Works under a jacket, works alone.',
   '100% cotton, 210 gsm.', 'Regular with an extended sleeve length.',
   'Ribbed cuffs, side-seam construction, tonal neck label.',
   7500, null, false, 'active', 'tees', null, 'afterdark', 'drop-001'),
  ('pit-hoodie', 'Pit Hoodie', 'Deep Black',
   '480 gsm brushed-back fleece, cut heavy enough to stand on its own. Designed for standing around a workshop at 2am.',
   '80% cotton / 20% recycled polyester, 480 gsm brushed back.', 'Oversized. Take your normal size for volume, one down for regular.',
   'Double-layer hood, kangaroo pocket, embroidered wordmark.',
   13000, null, true, 'active', 'hoodies', 'LIMITED', 'afterdark', 'drop-001'),
  ('racing-division-hoodie', 'Racing Division Hoodie', 'Graphite / Signal',
   'Full racing back panel, sponsor-style typography and one single hit of signal red. The loudest piece in the drop.',
   '80% cotton / 20% polyester, 450 gsm.', 'Relaxed, true to size.',
   'Puff print back panel, embroidered sleeve number, tonal drawcords.',
   14000, 15500, false, 'active', 'hoodies', 'LIMITED', 'motor-division', 'drop-001'),
  ('midnight-zipper', 'Midnight Zipper', 'Deep Black',
   'Full-zip layer with a collar that actually covers your neck at speed. Reflective tape across the back yoke.',
   '82% cotton / 18% polyester, 460 gsm.', 'Regular with a longer body and sleeve.',
   'Metal zip, high funnel collar, reflective back detail, zip pockets.',
   14500, null, true, 'active', 'zipper', null, 'afterdark', 'drop-001'),
  ('heavyweight-jogger', 'Heavyweight Jogger', 'Deep Black',
   'Matching 480 gsm bottom to the Pit Hoodie. Tapered leg, deep pockets, no branding louder than a heat-transfer tag.',
   '80% cotton / 20% recycled polyester, 480 gsm.', 'Regular with a tapered leg. Elastic waist and drawcord.',
   'Two side pockets, one zipped back pocket, ribbed cuff.',
   11000, null, false, 'active', 'bottoms', null, 'essentials', 'drop-001'),
  ('garage-cap', 'Garage Cap', 'Bone',
   'Unstructured six-panel with a low crown and a curved brim broken in from the start.',
   '100% washed cotton twill.', 'One size, adjustable metal clasp.',
   'Embroidered front wordmark, tonal eyelets, cotton sweatband.',
   4500, null, false, 'active', 'accessories', null, 'essentials', 'drop-001'),
  ('apex-balaclava', 'Apex Balaclava', 'Deep Black',
   'Thin merino-blend balaclava that fits under a helmet without bunching. First run gone in a weekend.',
   '70% merino wool / 30% nylon.', 'One size, close fitting.',
   'Flatlock seams, no front branding.',
   3500, null, false, 'sold_out', 'accessories', 'SOLD OUT', 'motor-division', 'drop-001'),
  ('motor-division-jacket', 'Motor Division Jacket', 'Asphalt — Drop 002',
   'The first OSNEEZ riding-adjacent outer layer. Waxed shell, articulated sleeves, storm cuffs. Releasing with Drop 002.',
   'Waxed cotton shell, quilted lining. Final spec in progress.', 'Regular over a hoodie.',
   'Sample stage. Join the inner circle for the release window.',
   24500, null, false, 'coming_soon', 'zipper', 'UPCOMING', 'motor-division', 'drop-002')
) as seed (
  slug, name, subtitle, description, material, fit, details,
  price, compare_at_price, featured, status, category, badge,
  collection_slug, drop_slug
)
left join public.collections c on c.slug = seed.collection_slug
left join public.drops d on d.slug = seed.drop_slug
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  description = excluded.description,
  material = excluded.material,
  fit = excluded.fit,
  details = excluded.details,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  featured = excluded.featured,
  status = excluded.status,
  category = excluded.category,
  badge = excluded.badge,
  collection_id = excluded.collection_id,
  drop_id = excluded.drop_id;

-- Variants ------------------------------------------------------------------
-- Apparel sizes for everything except bottoms (S–XL) and accessories (one size).
insert into public.product_variants (product_id, sku, size, color, stock, active)
select
  p.id,
  'OSN-' || upper(left(p.slug, 6)) || '-' || replace(s.size, ' ', ''),
  s.size,
  coalesce(p.subtitle, 'Deep Black'),
  s.stock,
  true
from public.products p
join lateral (
  select size, stock from (
    select unnest(
      case
        when p.category = 'accessories' then array['ONE SIZE']
        when p.category = 'bottoms' then array['S', 'M', 'L', 'XL']
        else array['XS', 'S', 'M', 'L', 'XL', 'XXL']
      end
    ) as size,
    case
      when p.status <> 'active' then 0
      when p.badge = 'LIMITED' then 5
      else 24
    end as stock
  ) v
) s on true
on conflict (sku) do update set
  stock = excluded.stock,
  active = excluded.active;

-- World stories -------------------------------------------------------------
insert into public.world_stories (slug, title, location, timestamp_label, excerpt, published_at) values
  ('night-run-001', 'NIGHT RUN 001', 'BERLIN', '02:14 AM', 'Twenty-two bikes, one tunnel, no plan. The first OSNEEZ ride out and the shoot that became Drop 001.', '2026-02-01T00:00:00Z'),
  ('behind-the-drop', 'BEHIND THE DROP', 'WORKSHOP', 'DROP 001', 'Fabric weights, four sampling rounds and the reason the Pit Hoodie ended up at 480 gsm.', '2026-02-08T00:00:00Z'),
  ('ride-with-us', 'RIDE WITH US', 'OPEN CALL', 'ONGOING', 'Meets, garage nights and city runs. If you ride, build or shoot — this is the way in.', '2026-03-02T00:00:00Z')
on conflict (slug) do update set
  title = excluded.title,
  location = excluded.location,
  timestamp_label = excluded.timestamp_label,
  excerpt = excluded.excerpt;
