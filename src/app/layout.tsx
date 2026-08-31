import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";

import { SITE } from "@/lib/site";

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

/**
 * Root layout holds only the document shell. Storefront chrome lives in
 * (site)/layout.tsx, the admin brings its own — so /admin never renders a
 * shop header or cart.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${anton.variable} ${archivo.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <div className="os-grain" aria-hidden="true" />
      </body>
    </html>
  );
}
