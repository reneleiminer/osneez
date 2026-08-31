import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { PageTransition } from "@/components/layout/page-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Storefront shell: announcement bar, header, footer, cart and page
 * transitions.
 *
 * Deliberately synchronous, top to bottom. React drops suspending subtrees
 * while rendering a notFound() boundary, so any await in this chain would
 * leave every 404 page without chrome. Search data is fetched on demand from
 * /api/search instead of being inlined into every document.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <PageTransition />
    </CartProvider>
  );
}
