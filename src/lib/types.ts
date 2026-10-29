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

/** A category with its descendants, in catalog (orderHint) order */
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export const SORT_OPTIONS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "name-asc": "Name: A to Z",
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

/** PLP filters in display order. The keys double as URL params, e.g. ?color=white&color=gray */
export const FACETS = {
  color: "Color",
  finish: "Material finish",
  price: "Price",
} as const;

export type FacetName = keyof typeof FACETS;

/** Selected values per facet; values within a facet are ORed, facets are ANDed */
export type FacetSelection = Partial<Record<FacetName, string[]>>;

export interface Facet {
  name: FacetName;
  label: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  label: string;
  /** Products matching this value within the current category and search, ignoring other filters */
  count: number;
  selected: boolean;
}

export interface ProductListQuery {
  categoryId?: string;
  text?: string;
  filters?: FacetSelection;
  sort: SortOption;
  page: number;
}

export interface ProductListResult {
  products: ProductSummary[];
  facets: Facet[];
  total: number;
  page: number;
  pageCount: number;
}

/** A selectable variant dimension, e.g. color or size, with the values offered across variants */
export interface ProductOption {
  name: string;
  label: string;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  value: string;
  /** CSS color for swatch-style options */
  swatch?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  images: ProductImage[];
  price?: Price;
  inStock: boolean;
  /** Option name to value, e.g. { color: "Plum", size: "Queen" } */
  options: Record<string, string>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Short spec bullet points */
  details: string[];
  categoryIds: string[];
  /** The master variant comes first */
  variants: ProductVariant[];
  /** Only options whose value differs between variants */
  options: ProductOption[];
}

/** Largest quantity a shopper can pick for one line item */
export const MAX_QUANTITY = 10;

export interface CartLineItem {
  id: string;
  productSlug: string;
  name: string;
  sku: string;
  image?: ProductImage;
  quantity: number;
  price: Price;
  total: Money;
}

export interface Cart {
  id: string;
  lineItems: CartLineItem[];
  totalQuantity: number;
  total: Money;
}
