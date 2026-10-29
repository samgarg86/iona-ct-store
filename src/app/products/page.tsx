import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { ActiveFilters, FacetFilters } from "@/components/plp/facet-filters";
import { Pagination } from "@/components/plp/pagination";
import { ProductGridSkeleton } from "@/components/plp/product-grid-skeleton";
import { SortSelect } from "@/components/plp/sort-select";
import { getCategoryBySlug, getCategoryTrail } from "@/lib/commercetools/categories";
import { searchProducts } from "@/lib/commercetools/products";
import { env } from "@/lib/env";
import {
  clearFiltersHref,
  hasFilters,
  listingHref,
  parseListingParams,
  type ListingParams,
} from "@/lib/listing-params";
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

  const category = params.category ? await getCategoryBySlug(params.category) : undefined;
  if (params.category && !category) notFound();

  const [trail, result] = await Promise.all([
    getCategoryTrail(category?.id),
    searchProducts({
      categoryId: category?.id,
      text: params.q,
      filters: params.filters,
      sort: params.sort,
      page: params.page,
    }),
  ]);

  const title = params.q ? `Results for “${params.q}”` : (category?.name ?? "All products");
  const sortHrefs = Object.fromEntries(
    Object.keys(SORT_OPTIONS).map((sort) => [sort, listingHref({ ...params, sort: sort as SortOption, page: 1 })]),
  ) as Record<SortOption, string>;
  const selectedCount = Object.values(params.filters).flat().length;

  return (
    <>
      <div className="flex flex-col gap-2">
        {category && <Breadcrumbs trail={trail.slice(0, -1)} current={category.name} />}
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <FacetFilters facets={result.facets} params={params} />
        </aside>

        <div className="flex flex-col gap-6">
          <details className="group rounded-lg border border-border lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
              Filters{selectedCount > 0 && ` (${selectedCount})`}
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" strokeWidth={1.5} />
            </summary>
            <div className="border-t border-border p-4">
              <FacetFilters facets={result.facets} params={params} />
            </div>
          </details>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted">
              {result.total} {result.total === 1 ? "product" : "products"}
            </p>
            <SortSelect value={params.sort} hrefs={sortHrefs} />
          </div>

          <ActiveFilters facets={result.facets} params={params} />

          {result.products.length > 0 ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {result.products.map((product, index) => (
                <li key={product.id}>
                  <ProductCard product={product} locale={env.locale} priority={index < 3} />
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
        </div>
      </div>
    </>
  );
}

function EmptyState({ params }: { params: ListingParams }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-lg">No products found.</p>
      {hasFilters(params) ? (
        <>
          <p className="text-sm text-muted">No products match all of these filters.</p>
          <Link href={clearFiltersHref(params)} className="text-sm font-medium underline">
            Clear filters
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">
            {params.q ? "Try a different search term or browse a category." : "Try another category."}
          </p>
          <Link href="/products" className="text-sm font-medium underline">
            View all products
          </Link>
        </>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <>
      <div className="h-9 w-56 animate-pulse rounded bg-surface" />
      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <div className="hidden h-96 animate-pulse rounded-lg bg-surface lg:block" />
        <div className="flex flex-col gap-6">
          <div className="h-px bg-border" />
          <ProductGridSkeleton />
        </div>
      </div>
    </>
  );
}
