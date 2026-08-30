import Link from "next/link";

import { CATEGORIES } from "@/lib/site";

export function CategoryFilter({ active }: { active?: string | null }) {
  const items = [{ slug: "", label: "All" }, ...CATEGORIES];

  return (
    <nav aria-label="Kategorien" className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 px-1">
        {items.map((item) => {
          const isActive = (active ?? "") === item.slug;
          return (
            <li key={item.slug || "all"}>
              <Link
                href={item.slug ? `/shop?category=${item.slug}` : "/shop"}
                data-active={isActive}
                className="os-label block border os-rule px-4 py-2.5 text-[0.625rem] text-smoke transition-colors hover:border-bone hover:text-bone data-[active=true]:border-bone data-[active=true]:bg-bone data-[active=true]:text-void"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
