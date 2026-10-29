import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import type { ProductRailBlock } from "@/content/home";
import { getCategoryBySlug } from "@/lib/commercetools/categories";
import { getCategoryProducts } from "@/lib/commercetools/products";
import { env } from "@/lib/env";
import { listingHref } from "@/lib/listing-params";

/** A row of products that scrolls sideways, snapping to cards */
export async function ProductRail({ title, categorySlug, limit }: ProductRailBlock) {
  const category = await getCategoryBySlug(categorySlug);
  const products = category ? await getCategoryProducts(category.id, limit) : [];
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Link href={listingHref({ category: categorySlug })} className="text-sm font-medium underline">
          View all
        </Link>
      </div>
      {/* Negative margins let cards scroll to the screen edge while lining up with the page gutter */}
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
        {products.map((product) => (
          <li key={product.id} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-3rem)/4)]">
            <ProductCard product={product} locale={env.locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
