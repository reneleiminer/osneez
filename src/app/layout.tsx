import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { PageTransition } from "@/components/layout/page-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { primaryImage } from "@/lib/shop/product";
import { getProducts } from "@/lib/shop/queries";
import { SITE } from "@/lib/site";
import type { SearchItem } from "@/types/shop";

import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s — OSNEEZ®",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "OSNEEZ",
    "streetwear",
    "motorcycle streetwear",
    "hoodie",
    "drop",
    "limited",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const products = await getProducts();
  const searchItems: SearchItem[] = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle,
    price: product.price,
    category: product.category,
    image: primaryImage(product)?.image_url ?? null,
    status: product.status,
  }));

  return (
    <html lang="de" className={`${anton.variable} ${archivo.variable}`}>
      <body className="min-h-dvh antialiased">
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader searchItems={searchItems} />
          <main id="main">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <PageTransition />
        </CartProvider>
        <div className="os-grain" aria-hidden="true" />
      </body>
    </html>
  );
}
