import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { Settings } from "@/types/settings";

/**
 * Storefront shell: announcement bar, header, footer, cart and page
 * transitions. Everything configurable comes from the company settings.
 */
export function SiteChrome({
  children,
  settings,
}: {
  children: ReactNode;
  settings: Settings;
}) {
  return (
    <CartProvider freeShippingThreshold={settings.free_shipping_threshold}>
      <AnnouncementBar lines={settings.announcements} />
      <SiteHeader
        socials={[
          { label: "Instagram", href: settings.instagram_url },
          { label: "TikTok", href: settings.tiktok_url },
        ].filter((s): s is { label: string; href: string } => Boolean(s.href))}
      />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
      <CartDrawer />
      <PageTransition />
    </CartProvider>
  );
}
