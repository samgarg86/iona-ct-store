import "server-only";

import type { _ProductSearchFacetExpression, _SearchQuery, SearchSorting } from "@commercetools/platform-sdk";
import { cacheLife } from "next/cache";

import { apiRoot } from "@/lib/commercetools/client";
import { toFacet, toProduct, toProductSummary } from "@/lib/commercetools/mappers";
import { env } from "@/lib/env";
import {
  FACETS,
  type FacetName,
  type FacetSelection,
  type Product,
  type ProductListQuery,
  type ProductListResult,
  type SortOption,
} from "@/lib/types";

export const PAGE_SIZE = 24;

/** Enum attributes from the B2C sample data, faceted and filtered by enum key */
const ATTRIBUTE_FACETS = {
  color: "variants.attributes.search-color.key",
  finish: "variants.attributes.search-finish.key",
} satisfies Partial<Record<FacetName, string>>;

const PRICE_FIELD = "variants.prices.centAmount";

/** Price bands in cents of the store currency (USD); the keys appear in the URL */
const PRICE_RANGES = [
  { key: "under-50", label: "Under $50", to: 5000 },
  { key: "50-200", label: "$50 – $200", from: 5000, to: 20000 },
  { key: "200-1000", label: "$200 – $1,000", from: 20000, to: 100000 },
  { key: "1000-plus", label: "$1,000+", from: 100000 },
];

/** Only facet, filter and sort on prices in the storefront currency */
const inStoreCurrency: _SearchQuery = {
  exact: { field: "variants.prices.currencyCode", value: env.currency },
};

/** Combines clauses; commercetools rejects an `and`/`or` with a single expression. */
function combine(operator: "and" | "or", clauses: _SearchQuery[]): _SearchQuery | undefined {
  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return operator === "and" ? { and: clauses } : { or: clauses };
}

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

  return combine("and", clauses);
}

const facetExpressions: _ProductSearchFacetExpression[] = [
  ...Object.entries(ATTRIBUTE_FACETS).map(([name, field]) => ({
    distinct: { name, field, fieldType: "lenum" as const, limit: 50 },
  })),
  {
    ranges: {
      name: "price",
      field: PRICE_FIELD,
      filter: inStoreCurrency,
      ranges: PRICE_RANGES.map(({ key, from, to }) => ({ key, from, to })),
    },
  },
];

/** Selected filters go in postFilter, which applies after facet counts, so other values stay selectable. */
function buildPostFilter(filters: FacetSelection = {}): _SearchQuery | undefined {
  const clauses: _SearchQuery[] = [];

  for (const [name, field] of Object.entries(ATTRIBUTE_FACETS)) {
    const values = filters[name as FacetName];
    if (values?.length) clauses.push({ exact: { field, fieldType: "lenum", values } });
  }

  const priceClause = combine(
    "or",
    PRICE_RANGES.filter((range) => filters.price?.includes(range.key)).map(({ from, to }) => ({
      and: [inStoreCurrency, { range: { field: PRICE_FIELD, gte: from, lt: to } }],
    })),
  );
  if (priceClause) clauses.push(priceClause);

  return combine("and", clauses);
}

/** Display labels for facet bucket keys, e.g. "white" → "White" */
const valueLabels: Record<FacetName, (key: string) => string> = {
  color: capitalize,
  finish: capitalize,
  price: (key) => PRICE_RANGES.find((range) => range.key === key)?.label ?? key,
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildSort(sort: SortOption): SearchSorting[] | undefined {
  switch (sort) {
    case "price-asc":
      return [{ field: "variants.prices.centAmount", order: "asc", mode: "min", filter: inStoreCurrency }];
    case "price-desc":
      return [{ field: "variants.prices.centAmount", order: "desc", mode: "max", filter: inStoreCurrency }];
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
        postFilter: buildPostFilter(query.filters),
        facets: facetExpressions,
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
    facets: (Object.keys(FACETS) as FacetName[]).map((name) =>
      toFacet(body.facets, name, query.filters?.[name], valueLabels[name]),
    ),
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
