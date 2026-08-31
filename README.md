# OSNEEZ®

Streetwear built after dark. Next.js 16 App Router storefront with a Supabase
catalogue backend and Stripe Checkout.

- **Stack:** Next.js 16.3 (App Router, Turbopack) · React 19 · TypeScript strict
  · Tailwind CSS v4 · Supabase · Stripe · Zod
- **Fonts:** Anton (display) + Archivo (UI), self-hosted through `next/font`
- **Palette:** deep black / asphalt / bone with one accent — signal red

---

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys you have
npm run dev
```

The storefront runs **without any environment variables**. Every data helper
falls back to the bundled demo catalogue in `src/lib/shop/seed.ts`, so a fresh
clone renders the complete shop immediately. Add Supabase to serve real data and
Stripe to enable checkout.

```bash
npm run build   # production build (must pass before committing)
npm run lint    # eslint
npm start       # serve the production build
```

---

## Environment variables

| Variable | Scope | Required for | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | metadata, sitemap, canonicals | absolute origin, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | public | catalogue from Supabase | also whitelists the image host |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | catalogue from Supabase | read-only, protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **server** | newsletter, order sync | bypasses RLS — never expose |
| `STRIPE_SECRET_KEY` | **server** | checkout, order summary | `sk_test_…` / `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | **server** | order sync | `whsec_…` |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | public | optional | campaign film for the hero |
| `NEXT_PUBLIC_HERO_POSTER_URL` | public | optional | poster frame for that video |
| `ADMIN_EMAILS` | **server** | `/admin` | comma-separated allowlist; empty = nobody gets in |
| `RESEND_API_KEY` | **server** | transactional email | free tier; or use `SMTP_URL` |
| `SMTP_URL` | **server** | transactional email | `smtps://user:pass@host:465` |

See `.env.example`. No secret values are committed.

---

## Database

Run the migrations in `supabase/migrations` in order, either through the
Supabase SQL editor or `supabase db push`:

1. `0001_shop_schema.sql` — tables, indexes, `updated_at` triggers, RLS
   policies and the four public storage buckets.
2. `0002_seed_demo_catalogue.sql` — optional demo catalogue that mirrors
   `src/lib/shop/seed.ts`. Safe to re-run, safe to skip.

### Tables

| Table | Purpose |
| --- | --- |
| `collections` | AFTERDARK / MOTOR DIVISION / ESSENTIALS lines |
| `drops` | release schedule, hero image + video per drop |
| `products` | catalogue; `price` is gross **cents**, VAT inclusive |
| `product_variants` | size / colour / stock / SKU |
| `product_images` | Storage URLs typed `front` `back` `detail` `lifestyle` |
| `world_stories` | OSNEEZ World editorials |
| `newsletter_subscribers` | inner-circle signups (unique email) |
| `orders` | Stripe order mirror, written by the webhook |

### Row level security

RLS is enabled on every table. `anon` and `authenticated` may **only read**
active collections, drops, products, their variants and images, plus published
world stories. There is no client-side write policy anywhere — newsletter
signups and order sync run server-side with the service-role key. Prices and
stock can therefore never be modified from the browser.

### Storage buckets

`products`, `collections`, `campaigns`, `world` — all public read, service-role
write. Store URLs in the database, never base64 payloads.

---

## Stripe

- `POST /api/checkout` accepts only `{ slug, size, quantity }` per line. Product
  name, **price**, availability and stock are re-resolved server-side in
  `src/lib/stripe/line-items.ts`; a client-supplied amount is impossible.
- Automatic tax, VAT-inclusive prices, billing + shipping address collection,
  promotion codes and invoice creation are enabled.
- Shipping is €4.90, free from €120 (`FREE_SHIPPING_THRESHOLD` in
  `src/lib/site.ts`).
- `POST /api/stripe/webhook` verifies the signature and upserts into `orders`
  on `checkout.session.completed` plus both async payment outcomes. Register the
  endpoint in the Stripe dashboard and copy the signing secret.

---

## Admin (`/admin`)

A built-in backoffice — no Shopify, no extra subscription.

**Setup**

1. Supabase → Authentication → Users → *Add user*, with a password.
2. Put that same address in `ADMIN_EMAILS` (Vercel → Environment Variables).
3. Redeploy, then sign in at `/admin/login`.

Authorisation fails closed: without `ADMIN_EMAILS` nobody has access, even
with valid Supabase credentials. `/admin` is excluded in `robots.txt` and
carries `noindex`.

**What it does**

| Screen | Purpose |
| --- | --- |
| Overview | product / order / revenue / subscriber counts, low-stock warning |
| Products | full CRUD, variants with size + colour + stock, drag-in image upload to Storage |
| Collections / Drops | CRUD incl. release date, hero image and video |
| World | editorial entries for `/world` |
| Orders | everything the Stripe webhook wrote, status switch to `fulfilled` |
| Newsletter | subscriber list, unsubscribe toggle, CSV export |
| Discounts | promo codes, mirrored into Stripe as coupon + promotion code |
| Shipping | zones per country group, several rates each, free-shipping thresholds |
| Returns | requests customers raise from their account, with a status workflow |
| Reports | revenue per day, bestsellers, order status, low stock, list growth |
| Legal | editable imprint, privacy, terms, returns and shipping texts |
| Settings | company data, storefront, shipping rates, accepted payment methods |
| Team | staff accounts with owner / editor / fulfilment roles |

**Roles.** `owner` sees everything. `editor` gets the catalogue, drops, world,
discounts and legal texts. `fulfilment` sees orders only. Every screen *and*
every server action is checked against the role, so a narrower account cannot
reach a wider section by crafting a request. Addresses listed in `ADMIN_EMAILS`
are always owners — that is the bootstrap, and it is what keeps you from
locking yourself out by editing the `staff` table.

**Shipping.** Zones group countries; each zone holds any number of rates with
their own price, free-shipping threshold, order-value window and delivery
estimate. The cart asks for the destination country, shows the resulting rate
before checkout, and the checkout session is then locked to that country — so
the price shown and the price charged cannot drift apart. Without zones the
flat rate from the settings applies, which is what a fresh install does.

**Fulfilment.** Each order has a detail screen with carrier, tracking number,
tracking link and an internal note; marking it shipped sets the status and
timestamp. `/admin/orders/[id]/slip` renders a printable packing slip on a
light background. The tracking link appears in the customer's account.

**Transactional email** is wired and waiting on credentials. Set either
`RESEND_API_KEY` or `SMTP_URL` and the shop sends an order confirmation from
the Stripe webhook, a shipping notification when an order is marked shipped,
and a status mail on every return update. Sender address, display name and the
three on/off switches live in Settings → E-Mail; a *Testmail* button verifies
the setup in one click. Every attempt is written to `email_log`, so a failure
is visible instead of silent, and confirmations are sent once per order.

Secrets are deliberately kept out of the database: `settings` is world
readable, so API keys belong in environment variables only.

**Tracking links** are derived from the carrier name and tracking number for
DHL, DPD, GLS, Hermes, UPS, Deutsche Post and FedEx — no contract needed. Leave
the link field empty and it fills itself.

What is deliberately *not* built: buying carrier labels and live carrier rates.
Both need a paid contract with DHL, DPD or a broker; there is no free path. The
data model has the fields such an integration would fill, so it can be added
later without a migration.

**Customer accounts** live at `/account`. Sign-up and sign-in run on Supabase
Auth; order history is matched on the email Stripe collected at checkout and
read through the customer's own session, so the row level security policy —
not application code — decides what comes back. Ordering as a guest stays
possible. Password reset and email confirmation need SMTP configured in
Supabase; the built-in sender is heavily rate limited.

**Settings drive the storefront.** Company details, announcement lines, social
links, hero media, shipping rates and countries, delivery estimates and the
accepted Stripe payment methods all live in the `settings` table — nothing of
that is hard-coded any more. The constants in `src/lib/site.ts` are only the
fallback used before the row exists.

Legal texts live in `legal_pages`. Bodies are plain text where a line starting
with `## ` opens a section, and `{{tokens}}` such as `{{legal_name}}` or
`{{free_shipping}}` are resolved from the settings at render time. A field that
is still empty renders as a visible `[Firmenname]` placeholder rather than
disappearing. Pages flagged as drafts show a warning banner and carry
`noindex`.

Prices are typed in euros and stored as cents. Every mutation runs through a
server action that verifies the session *before* touching the service-role
client, and calls `revalidatePath` so the storefront updates immediately.

Honest limits: this is a lean backoffice, not Shopify. No shipping labels, no
tax reports, no returns workflow, no app ecosystem. Invoices are generated by
Stripe.

## Project structure

```
src/
  app/
    layout.tsx         document shell only (fonts, metadata, grain)
    (site)/            storefront: /, /shop[/slug], /collections[/slug],
                       /drops[/slug], /world, /about, /contact, legal, /success
    admin/             backoffice, own shell — login/ is outside the guard,
                       (protected)/ requires an allowlisted session
    api/               checkout, newsletter, search, stripe/webhook
    sitemap.ts robots.ts icon.svg not-found.tsx
  components/
    layout/            header, mobile menu, search overlay, footer,
                       newsletter, announcement bar, page transition
    home/              hero, drop feature, featured, categories,
                       cinematic scroll, world preview
    shop/              product card, grid, category filter, quick add
    product/           gallery, buy box, accordion, size guide
    cart/              provider, drawer, clear-bag
    motion/            reveal, parallax, marquee, text reveal
    ui/                badge, section heading, product visual, legal page
  lib/
    shop/              queries (Supabase + seed fallback), seed data,
                       bag-store, product helpers
    supabase/          read client, admin client, config
    stripe/            line-item builder
    site.ts            brand constants, navigation, thresholds
  types/shop.ts        shared domain types
supabase/migrations/   SQL
```

Server Components render everything by default; only cart, search, menu,
gallery, buy box and the scroll effects are client components.

### Motion

Hand-rolled instead of a motion library: `IntersectionObserver` reveals,
`requestAnimationFrame` parallax and a CSS-only marquee — transform/opacity
only, no extra runtime dependency. `prefers-reduced-motion` disables all of it,
and a `@media (scripting: none)` fallback keeps content visible without JS.

---

## Assets still needed

Nothing is faked: every product renders a generated placeholder frame instead of
a stock photo. Replace by inserting rows into `product_images`.

| Asset | Where it lands |
| --- | --- |
| 4 shots per product (`front`, `back`, `detail`, `lifestyle`) | `product_images` / bucket `products` |
| Drop campaign key visual + hero film | `drops.hero_image` / `drops.hero_video` or `NEXT_PUBLIC_HERO_*` |
| Collection covers | `collections.cover_image` / bucket `collections` |
| OSNEEZ World editorial images | `world_stories.cover_image` / bucket `world` |

The favicon (`src/app/icon.svg`) and the OpenGraph share cards are generated,
not placeholders: `src/app/opengraph-image.tsx` renders the brand card and
`src/app/shop/[slug]/opengraph-image.tsx` a per-product card, both in Anton via
`next/og`. Once real photography exists, setting `openGraph.images` in a page's
metadata overrides the generated card.

Placeholder **copy** to replace before launch: contact addresses in
`src/app/contact/page.tsx` and `src/lib/site.ts`, the size tables in
`src/components/product/size-guide.tsx`, and every `[bracketed]` field on the
legal pages.

> The legal pages are working drafts, clearly marked as such in the UI. They are
> not legal advice and must be reviewed before the shop goes live.
