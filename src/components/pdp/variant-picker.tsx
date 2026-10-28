import Link from "next/link";

import type { Product, ProductVariant } from "@/lib/types";
import { productHref, variantForOption } from "@/lib/variants";

interface VariantPickerProps {
  product: Product;
  selected: ProductVariant;
}

/** Option selectors rendered as links, so switching variants works without JavaScript. */
export function VariantPicker({ product, selected }: VariantPickerProps) {
  return (
    <div className="flex flex-col gap-5">
      {product.options.map((option) => (
        <fieldset key={option.name} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm">
            <span className="text-muted">{option.label}:</span> {selected.options[option.name]}
          </legend>
          <ul className="flex flex-wrap gap-2">
            {option.values.map(({ value, swatch }) => {
              const target = variantForOption(product, selected, option.name, value);
              if (!target) return null;
              const active = selected.options[option.name] === value;
              const href = productHref(product.slug, target.sku);

              return (
                <li key={value}>
                  {swatch ? (
                    <Link
                      href={href}
                      replace
                      scroll={false}
                      aria-label={value}
                      aria-current={active ? "true" : undefined}
                      title={value}
                      className={`block size-9 rounded-full border p-0.5 transition-colors ${
                        active ? "border-foreground" : "border-border hover:border-muted"
                      }`}
                    >
                      <span
                        className="block size-full rounded-full border border-black/10"
                        style={{ background: swatch }}
                      />
                    </Link>
                  ) : (
                    <Link
                      href={href}
                      replace
                      scroll={false}
                      aria-current={active ? "true" : undefined}
                      className={`block min-w-12 rounded-md border px-3 py-1.5 text-center text-sm transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {value}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
