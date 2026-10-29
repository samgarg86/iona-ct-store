import { FACETS, SORT_OPTIONS, type FacetName, type FacetSelection, type SortOption } from "@/lib/types";

/** PLP state as it lives in the URL: /products?category=furniture&q=chair&color=white&sort=price-asc&page=2 */
export interface ListingParams {
  category?: string;
  q?: string;
  filters: FacetSelection;
  sort: SortOption;
  page: number;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

const FACET_NAMES = Object.keys(FACETS) as FacetName[];

function all(value: string | string[] | undefined): string[] {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.flatMap((item) => item?.trim() || []))];
}

function first(value: string | string[] | undefined): string | undefined {
  return all(value)[0];
}

function isSortOption(value: string | undefined): value is SortOption {
  return value !== undefined && value in SORT_OPTIONS;
}

export function parseListingParams(raw: RawSearchParams): ListingParams {
  const sort = first(raw.sort);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  const filters: FacetSelection = {};
  for (const name of FACET_NAMES) {
    const values = all(raw[name]);
    if (values.length > 0) filters[name] = values;
  }

  return {
    category: first(raw.category),
    q: first(raw.q),
    filters,
    sort: isSortOption(sort) ? sort : "featured",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Builds a PLP URL, omitting defaults so URLs stay short and shareable. */
export function listingHref(params: Partial<ListingParams>): string {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  for (const name of FACET_NAMES) {
    for (const value of params.filters?.[name] ?? []) search.append(name, value);
  }
  if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/products?${query}` : "/products";
}

/** The current listing with one filter value switched on or off, back on page 1. */
export function toggleFilterHref(params: ListingParams, name: FacetName, value: string): string {
  const selected = params.filters[name] ?? [];
  const values = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
  return listingHref({ ...params, filters: { ...params.filters, [name]: values }, page: 1 });
}

export function clearFiltersHref(params: ListingParams): string {
  return listingHref({ ...params, filters: {}, page: 1 });
}

export function hasFilters(params: ListingParams): boolean {
  return Object.values(params.filters).some((values) => values.length > 0);
}
