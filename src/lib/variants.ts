import type { Product, ProductVariant } from "@/lib/types";

/** PDP URL; the selected variant lives in the URL so it can be shared: /p/nala-sofa?sku=NTSS-02 */
export function productHref(slug: string, sku?: string): string {
  return sku ? `/p/${slug}?sku=${encodeURIComponent(sku)}` : `/p/${slug}`;
}

/** The variant for a SKU from the URL, falling back to the master variant. */
export function selectVariant(product: Product, sku: string | undefined): ProductVariant {
  return product.variants.find((variant) => variant.sku === sku) ?? product.variants[0];
}

/**
 * The variant to switch to when the shopper picks `value` for option `name`: keep the other
 * current choices if such a variant exists, otherwise take the first variant with that value.
 */
export function variantForOption(
  product: Product,
  current: ProductVariant,
  name: string,
  value: string,
): ProductVariant | undefined {
  const wanted = { ...current.options, [name]: value };
  const exact = product.variants.find((variant) =>
    Object.entries(wanted).every(([option, optionValue]) => variant.options[option] === optionValue),
  );
  return exact ?? product.variants.find((variant) => variant.options[name] === value);
}
