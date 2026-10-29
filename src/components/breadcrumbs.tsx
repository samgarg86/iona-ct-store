import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { listingHref } from "@/lib/listing-params";
import type { Category } from "@/lib/types";

interface BreadcrumbsProps {
  /** Linked categories, ancestors first */
  trail: Category[];
  /** The current page, shown unlinked at the end */
  current: string;
}

export function Breadcrumbs({ trail, current }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-0.5 text-xs text-muted">
        <li>
          <Link href="/products" className="hover:text-foreground hover:underline">
            Shop
          </Link>
        </li>
        {trail.map((category) => (
          <li key={category.id} className="flex items-center gap-0.5">
            <ChevronRight className="size-3" strokeWidth={1.5} />
            <Link href={listingHref({ category: category.slug })} className="hover:text-foreground hover:underline">
              {category.name}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-0.5">
          <ChevronRight className="size-3" strokeWidth={1.5} />
          <span aria-current="page" className="text-foreground">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
