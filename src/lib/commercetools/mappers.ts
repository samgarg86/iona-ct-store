import type {
  Attribute,
  Cart as CtCart,
  Category as CtCategory,
  Image as CtImage,
  LineItem,
  LocalizedString,
  Price as CtPrice,
  ProductProjection,
  ProductSearchFacetResult,
  ProductSearchFacetResultBucket,
  ProductVariant as CtProductVariant,
  TypedMoney,
} from "@commercetools/platform-sdk";

import {
  FACETS,
  type Cart,
  type CartLineItem,
  type Category,
  type Facet,
  type FacetName,
  type Money,
  type Price,
  type Product,
  type ProductImage,
  type ProductOption,
  type ProductSummary,
  type ProductVariant,
} from "@/lib/types";

/** Picks the requested locale, falling back to any available translation. */
export function localize(value: LocalizedString | undefined, locale: string): string {
  if (!value) return "";
  return value[locale] ?? Object.values(value)[0] ?? "";
}

export function toMoney(money: TypedMoney): Money {
  return {
    centAmount: money.centAmount,
    currencyCode: money.currencyCode,
    fractionDigits: money.fractionDigits,
  };
}

/** Maps the price commercetools selected via priceCurrency/priceCountry. */
export function toPrice(price: CtPrice | undefined): Price | undefined {
  if (!price) return undefined;
  return {
    value: toMoney(price.value),
    discounted: price.discounted ? toMoney(price.discounted.value) : undefined,
  };
}

export function toImage(image: CtImage, fallbackAlt: string): ProductImage {
  return {
    url: image.url,
    alt: image.label || fallbackAlt,
    width: image.dimensions?.w,
    height: image.dimensions?.h,
  };
}

export function toProductSummary(product: ProductProjection, locale: string): ProductSummary {
  const name = localize(product.name, locale);
  const variant = product.masterVariant;
  return {
    id: product.id,
    slug: localize(product.slug, locale),
    name,
    images: (variant.images ?? []).map((image) => toImage(image, name)),
    price: toPrice(variant.price),
  };
}

/** Maps a distinct or ranges facet result, keeping only values that match products or are selected. */
export function toFacet(
  results: ProductSearchFacetResult[],
  name: FacetName,
  selected: string[] = [],
  labelFor: (key: string) => string,
): Facet {
  const result = results.find((candidate) => candidate.name === name);
  const buckets = result && "buckets" in result ? (result as ProductSearchFacetResultBucket).buckets : [];
  return {
    name,
    label: FACETS[name],
    values: buckets
      .map(({ key, count }) => ({ value: key, label: labelFor(key), count, selected: selected.includes(key) }))
      .filter((value) => value.count > 0 || value.selected),
  };
}

export function toCategory(category: CtCategory, locale: string): Category {
  return {
    id: category.id,
    slug: localize(category.slug, locale),
    name: localize(category.name, locale),
    parentId: category.parent?.id,
  };
}

/**
 * Variant attributes shown as selectable options on the PDP. These names come from the
 * commercetools B2C sample data product types.
 */
const VARIANT_OPTIONS = [
  { name: "color", label: "Color", attribute: "color-label", swatchAttribute: "color-code" },
  { name: "finish", label: "Finish", attribute: "finish-label", swatchAttribute: "finish-code" },
  { name: "size", label: "Size", attribute: "size" },
  { name: "type", label: "Type", attribute: "type" },
];

const DETAILS_ATTRIBUTE = "productspec";

/** Renders text, localized text, (localized) enum and set attribute values as display text. */
function attributeText(value: unknown, locale: string): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const parts = value.map((item) => attributeText(item, locale)).filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : undefined;
  }
  if (value && typeof value === "object") {
    if ("label" in value) return attributeText(value.label, locale);
    return localize(value as LocalizedString, locale) || undefined;
  }
  return undefined;
}

function findAttribute(attributes: Attribute[] | undefined, name: string, locale: string) {
  const attribute = attributes?.find((candidate) => candidate.name === name);
  return attribute ? attributeText(attribute.value, locale) : undefined;
}

function toVariant(variant: CtProductVariant, productName: string, locale: string): ProductVariant {
  const options: Record<string, string> = {};
  for (const option of VARIANT_OPTIONS) {
    const value = findAttribute(variant.attributes, option.attribute, locale);
    if (value) options[option.name] = value;
  }

  return {
    id: variant.id,
    sku: variant.sku ?? "",
    images: (variant.images ?? []).map((image) => toImage(image, productName)),
    price: toPrice(variant.price),
    // Variants without inventory tracking are sellable
    inStock: variant.availability?.isOnStock ?? true,
    options,
  };
}

/** Collects the option values offered across variants, keeping only options that actually vary. */
function toOptions(variants: CtProductVariant[], locale: string): ProductOption[] {
  return VARIANT_OPTIONS.flatMap((option) => {
    const values = new Map<string, string | undefined>();
    for (const variant of variants) {
      const value = findAttribute(variant.attributes, option.attribute, locale);
      if (value && !values.has(value)) {
        const swatch = option.swatchAttribute
          ? findAttribute(variant.attributes, option.swatchAttribute, locale)
          : undefined;
        values.set(value, swatch);
      }
    }
    if (values.size < 2) return [];
    return [
      {
        name: option.name,
        label: option.label,
        values: [...values].map(([value, swatch]) => ({ value, swatch })),
      },
    ];
  });
}

/** Splits a "- item\n- item" spec attribute into bullet points. */
function toDetails(spec: string | undefined): string[] {
  if (!spec) return [];
  return spec
    .split("\n")
    .map((line) => line.replace(/^\s*-\s*/, "").trim())
    .filter(Boolean);
}

export function toProduct(product: ProductProjection, locale: string): Product {
  const name = localize(product.name, locale);
  const variants = [product.masterVariant, ...product.variants];
  return {
    id: product.id,
    slug: localize(product.slug, locale),
    name,
    description: localize(product.description, locale),
    details: toDetails(findAttribute(product.masterVariant.attributes, DETAILS_ATTRIBUTE, locale)),
    categoryIds: product.categories.map((category) => category.id),
    variants: variants.filter((variant) => variant.sku).map((variant) => toVariant(variant, name, locale)),
    options: toOptions(variants, locale),
  };
}

function toLineItem(lineItem: LineItem, locale: string): CartLineItem {
  const name = localize(lineItem.name, locale);
  const image = lineItem.variant.images?.[0];
  return {
    id: lineItem.id,
    productSlug: localize(lineItem.productSlug, locale),
    name,
    sku: lineItem.variant.sku ?? "",
    image: image ? toImage(image, name) : undefined,
    quantity: lineItem.quantity,
    price: toPrice(lineItem.price) as Price,
    total: toMoney(lineItem.totalPrice),
  };
}

export function toCart(cart: CtCart, locale: string): Cart {
  return {
    id: cart.id,
    lineItems: cart.lineItems.map((lineItem) => toLineItem(lineItem, locale)),
    totalQuantity: cart.totalLineItemQuantity ?? 0,
    total: toMoney(cart.totalPrice),
  };
}
