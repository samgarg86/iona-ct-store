import Link from "next/link";

import { listingHref, type ListingParams } from "@/lib/listing-params";
import type { Category } from "@/lib/types";

interface CategoryPillsProps {
  categories: Category[];
  params: ListingParams;
}

/** Sub-category links that scroll sideways when they overflow. Search and sort carry over; filters reset. */
export function CategoryPills({ categories, params }: CategoryPillsProps) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Categories" className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
      <ul className="flex gap-2">
        {categories.map((category) => {
          const active = category.slug === params.category;
          return (
            <li key={category.id}>
              <Link
                href={listingHref({ category: category.slug, q: params.q, sort: params.sort })}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                }`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
