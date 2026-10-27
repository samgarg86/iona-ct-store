import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { CategoryNav } from "@/components/plp/category-nav";
import { Pagination } from "@/components/plp/pagination";
import { ProductGridSkeleton } from "@/components/plp/product-grid-skeleton";
import { SortSelect } from "@/components/plp/sort-select";
import { getCategoryBySlug, getTopLevelCategories } from "@/lib/commercetools/categories";
import { searchProducts } from "@/lib/commercetools/products";
import { env } from "@/lib/env";
import { listingHref, parseListingParams, type ListingParams } from "@/lib/listing-params";
import { SORT_OPTIONS, type SortOption } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function ProductListing({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const params = parseListingParams(await searchParams);

  const [categories, category] = await Promise.all([
    getTopLevelCategories(),
    params.category ? getCategoryBySlug(params.category) : undefined,
  ]);
  if (params.category && !category) notFound();

  const result = await searchProducts({
    categoryId: category?.id,
    text: params.q,
    sort: params.sort,
    page: params.page,
  });

  const title = params.q ? `Results for “${params.q}”` : (category?.name ?? "All products");
  const sortHrefs = Object.fromEntries(
    Object.keys(SORT_OPTIONS).map((sort) => [sort, listingHref({ ...params, sort: sort as SortOption, page: 1 })]),
  ) as Record<SortOption, string>;

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <CategoryNav categories={categories} activeSlug={category?.slug} />
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <p className="text-sm text-muted">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>
        <SortSelect value={params.sort} hrefs={sortHrefs} />
      </div>

      {result.products.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {result.products.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} locale={env.locale} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState params={params} />
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        hrefForPage={(page) => listingHref({ ...params, page })}
      />
    </>
  );
}

function EmptyState({ params }: { params: ListingParams }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-lg">No products found.</p>
      <p className="text-sm text-muted">
        {params.q ? "Try a different search term or browse a category." : "Try another category."}
      </p>
      <Link href="/products" className="text-sm font-medium underline">
        View all products
      </Link>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="h-9 w-56 animate-pulse rounded bg-surface" />
        <div className="h-8 w-full max-w-md animate-pulse rounded-full bg-surface" />
      </div>
      <div className="h-px bg-border" />
      <ProductGridSkeleton />
    </>
  );
}
