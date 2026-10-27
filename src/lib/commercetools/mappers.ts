import type {
  Category as CtCategory,
  Image as CtImage,
  LocalizedString,
  Price as CtPrice,
  ProductProjection,
  TypedMoney,
} from "@commercetools/platform-sdk";

import type { Category, Money, Price, ProductImage, ProductSummary } from "@/lib/types";

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

export function toCategory(category: CtCategory, locale: string): Category {
  return {
    id: category.id,
    slug: localize(category.slug, locale),
    name: localize(category.name, locale),
    parentId: category.parent?.id,
  };
}
