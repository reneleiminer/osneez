import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSNEEZ — Move different.",
  description: "Independent streetwear. Small runs, no compromise.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
