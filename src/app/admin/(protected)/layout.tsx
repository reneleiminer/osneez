import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/supabase/auth";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/drops", label: "Drops" },
  { href: "/admin/world", label: "World" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/newsletter", label: "Newsletter" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh bg-void">
      <header className="sticky top-0 z-40 border-b os-rule bg-void/90 backdrop-blur-lg">
        <div className="os-edge flex h-16 items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <Link href="/admin" className="os-display text-xl tracking-[-0.03em]">
              OSNEEZ
            </Link>
            <span className="os-label text-[0.5625rem] text-signal">Admin</span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="os-label os-underline hidden text-[0.625rem] text-smoke sm:block"
            >
              View shop
            </Link>
            <span className="os-label hidden text-[0.625rem] text-smoke md:block">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="os-label text-[0.625rem] text-smoke transition-colors hover:text-signal"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Admin" className="os-edge -mx-1 overflow-x-auto">
          <ul className="flex min-w-max gap-6 px-1 pb-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="os-label os-underline text-[0.625rem] text-bone/75 transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="os-edge py-10">{children}</main>
    </div>
  );
}
