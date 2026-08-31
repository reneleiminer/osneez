import type { Metadata } from "next";
import Link from "next/link";

import { canAccess, requireAdmin, type AdminSection } from "@/lib/supabase/auth";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV: { href: string; label: string; section: AdminSection }[] = [
  { href: "/admin", label: "Overview", section: "overview" },
  { href: "/admin/products", label: "Products", section: "products" },
  { href: "/admin/collections", label: "Collections", section: "collections" },
  { href: "/admin/drops", label: "Drops", section: "drops" },
  { href: "/admin/world", label: "World", section: "world" },
  { href: "/admin/discounts", label: "Discounts", section: "discounts" },
  { href: "/admin/orders", label: "Orders", section: "orders" },
  { href: "/admin/newsletter", label: "Newsletter", section: "newsletter" },
  { href: "/admin/reports", label: "Reports", section: "reports" },
  { href: "/admin/legal", label: "Legal", section: "legal" },
  { href: "/admin/settings", label: "Settings", section: "settings" },
  { href: "/admin/staff", label: "Team", section: "staff" },
];

const ROLE_LABEL: Record<string, string> = {
  owner: "Inhaber",
  editor: "Redaktion",
  fulfilment: "Versand",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const nav = NAV.filter((item) => canAccess(session.role, item.section));

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
              {session.email} · {ROLE_LABEL[session.role] ?? session.role}
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
            {nav.map((item) => (
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
