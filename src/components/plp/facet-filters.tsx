import { Check, ChevronDown, X } from "lucide-react";
import Link from "next/link";

import { clearFiltersHref, toggleFilterHref, type ListingParams } from "@/lib/listing-params";
import type { Facet } from "@/lib/types";

interface FacetFiltersProps {
  facets: Facet[];
  params: ListingParams;
}

/** Each value is a link that toggles it in the URL, so filtering needs no client JS. */
export function FacetFilters({ facets, params }: FacetFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      {facets
        .filter((facet) => facet.values.length > 0)
        .map((facet) => (
          <details key={facet.name} className="group/facet">
            <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium">
              {facet.label}
              <ChevronDown
                className="size-4 text-muted transition-transform group-open/facet:rotate-180"
                strokeWidth={1.5}
              />
            </summary>
            {facet.name === "color" ? (
              <SwatchGrid facet={facet} params={params} />
            ) : (
              <CheckboxList facet={facet} params={params} />
            )}
          </details>
        ))}
    </div>
  );
}

interface FacetValuesProps {
  facet: Facet;
  params: ListingParams;
}

function CheckboxList({ facet, params }: FacetValuesProps) {
  return (
    <ul aria-label={facet.label} className="mt-1 flex flex-col">
      {facet.values.map((value) => (
        <li key={value.value}>
          <Link
            href={toggleFilterHref(params, facet.name, value.value)}
            role="checkbox"
            aria-checked={value.selected}
            rel="nofollow"
            scroll={false}
            className="group/option flex items-center gap-2.5 py-1.5 text-sm"
          >
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                value.selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border group-hover/option:border-foreground"
              }`}
            >
              {value.selected && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className="flex-1">{value.label}</span>
            <span className="text-xs text-muted">{value.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * A diagonal line under every swatch. Opaque colors cover it, so it only shows through
 * see-through keys like "transparent".
 */
const SWATCH_SLASH =
  "linear-gradient(to top right, transparent calc(50% - 0.75px), var(--border) calc(50% - 0.75px), var(--border) calc(50% + 0.75px), transparent calc(50% + 0.75px))";

/** Color keys in the sample data are CSS color names, so each key paints its own swatch. */
function SwatchGrid({ facet, params }: FacetValuesProps) {
  return (
    <ul aria-label={facet.label} className="mt-2 flex flex-wrap gap-2.5 p-0.5">
      {facet.values.map((value) => (
        <li key={value.value}>
          <Link
            href={toggleFilterHref(params, facet.name, value.value)}
            role="checkbox"
            aria-checked={value.selected}
            aria-label={value.label}
            title={value.label}
            rel="nofollow"
            scroll={false}
            style={{ backgroundImage: SWATCH_SLASH }}
            className={`block size-7 overflow-hidden rounded-full border border-border ring-offset-2 ring-offset-background transition-shadow ${
              value.selected ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-muted"
            }`}
          >
            <span className="block size-full" style={{ background: value.value }} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Removable chips for the selected filter values, plus a link to clear them all. */
export function ActiveFilters({ facets, params }: FacetFiltersProps) {
  const selected = facets.flatMap((facet) =>
    facet.values.filter((value) => value.selected).map((value) => ({ facet: facet.name, ...value })),
  );
  if (selected.length === 0) return null;

  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {selected.map((value) => (
        <li key={`${value.facet}-${value.value}`}>
          <Link
            href={toggleFilterHref(params, value.facet, value.value)}
            aria-label={`Remove filter: ${value.label}`}
            rel="nofollow"
            scroll={false}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:border-foreground"
          >
            {value.label}
            <X className="size-3.5" strokeWidth={1.5} />
          </Link>
        </li>
      ))}
      <li>
        <Link href={clearFiltersHref(params)} scroll={false} className="px-1 text-sm underline">
          Clear all
        </Link>
      </li>
    </ul>
  );
}
