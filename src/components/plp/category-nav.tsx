import Link from "next/link";

import { listingHref } from "@/lib/listing-params";
import type { Category } from "@/lib/types";

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  const items = [{ slug: undefined, name: "All" }, ...categories];

  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-2">
        {items.map((item) => {
          const active = item.slug === activeSlug;
          return (
            <li key={item.slug ?? "all"}>
              <Link
                href={listingHref({ category: item.slug })}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
