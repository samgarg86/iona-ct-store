import { SORT_OPTIONS, type SortOption } from "@/lib/types";

/** PLP state as it lives in the URL: /products?category=furniture&q=chair&sort=price-asc&page=2 */
export interface ListingParams {
  category?: string;
  q?: string;
  sort: SortOption;
  page: number;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  const result = Array.isArray(value) ? value[0] : value;
  return result?.trim() || undefined;
}

function isSortOption(value: string | undefined): value is SortOption {
  return value !== undefined && value in SORT_OPTIONS;
}

export function parseListingParams(raw: RawSearchParams): ListingParams {
  const sort = first(raw.sort);
  const page = Number.parseInt(first(raw.page) ?? "1", 10);
  return {
    category: first(raw.category),
    q: first(raw.q),
    sort: isSortOption(sort) ? sort : "featured",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Builds a PLP URL, omitting defaults so URLs stay short and shareable. */
export function listingHref(params: Partial<ListingParams>): string {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/products?${query}` : "/products";
}
