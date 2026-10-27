// Storefront domain types. UI code depends on these, never on raw commercetools SDK types.

export interface Money {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
}

export interface Price {
  value: Money;
  /** Set when a product discount applies */
  discounted?: Money;
}

export interface ProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  images: ProductImage[];
  price?: Price;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parentId?: string;
}

export const SORT_OPTIONS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A to Z",
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

export interface ProductListQuery {
  categoryId?: string;
  text?: string;
  sort: SortOption;
  page: number;
}

export interface ProductListResult {
  products: ProductSummary[];
  total: number;
  page: number;
  pageCount: number;
}
