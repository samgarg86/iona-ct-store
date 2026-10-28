import "server-only";

import type { _SearchQuery, SearchSorting } from "@commercetools/platform-sdk";
import { cacheLife } from "next/cache";

import { apiRoot } from "@/lib/commercetools/client";
import { toProduct, toProductSummary } from "@/lib/commercetools/mappers";
import { env } from "@/lib/env";
import type { Product, ProductListQuery, ProductListResult, SortOption } from "@/lib/types";

export const PAGE_SIZE = 24;

function buildQuery({ categoryId, text }: ProductListQuery): _SearchQuery | undefined {
  const clauses: _SearchQuery[] = [];

  if (categoryId) {
    // categoriesSubTree also matches products in child categories
    clauses.push({ exact: { field: "categoriesSubTree", value: categoryId } });
  }
  if (text) {
    clauses.push({
      fullText: { field: "name", language: env.locale, value: text, mustMatch: "all" },
    });
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { and: clauses };
}

function buildSort(sort: SortOption): SearchSorting[] | undefined {
  // Only sort on prices in the storefront currency
  const priceFilter: _SearchQuery = {
    exact: { field: "variants.prices.currencyCode", value: env.currency },
  };

  switch (sort) {
    case "price-asc":
      return [{ field: "variants.prices.centAmount", order: "asc", mode: "min", filter: priceFilter }];
    case "price-desc":
      return [{ field: "variants.prices.centAmount", order: "desc", mode: "max", filter: priceFilter }];
    case "name-asc":
      return [{ field: "name", language: env.locale, order: "asc" }];
    case "featured":
      return undefined;
  }
}

const projectionParameters = {
  priceCurrency: env.currency,
  priceCountry: env.country,
  localeProjection: [env.locale],
};

export async function searchProducts(query: ProductListQuery): Promise<ProductListResult> {
  "use cache";
  cacheLife("minutes");

  const { body } = await apiRoot
    .products()
    .search()
    .post({
      body: {
        query: buildQuery(query),
        sort: buildSort(query.sort),
        limit: PAGE_SIZE,
        offset: (query.page - 1) * PAGE_SIZE,
        productProjectionParameters: projectionParameters,
      },
    })
    .execute();

  return {
    products: body.results
      .map((result) => result.productProjection)
      .filter((projection) => projection !== undefined)
      .map((projection) => toProductSummary(projection, env.locale)),
    total: body.total,
    page: query.page,
    pageCount: Math.ceil(body.total / PAGE_SIZE),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("minutes");

  const { body } = await apiRoot
    .products()
    .search()
    .post({
      body: {
        query: { exact: { field: "slug", language: env.locale, value: slug } },
        limit: 1,
        productProjectionParameters: projectionParameters,
      },
    })
    .execute();

  const projection = body.results[0]?.productProjection;
  return projection ? toProduct(projection, env.locale) : undefined;
}
