import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import type { ProductRailBlock } from "@/content/home";
import { getCategoryBySlug } from "@/lib/commercetools/categories";
import { getCategoryProducts } from "@/lib/commercetools/products";
import { env } from "@/lib/env";
import { listingHref } from "@/lib/listing-params";

/** A short grid of products from one category, linking on to the full listing */
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
      {/* 2 or 4 columns, never 3, so a 4-product rail never leaves a lone card on its own row */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} locale={env.locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
