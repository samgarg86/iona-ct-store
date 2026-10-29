import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { SORT_OPTIONS, type SortOption } from "@/lib/types";

interface SortOptionsProps {
  value: SortOption;
  /** Precomputed URL per option, so this component needs no knowledge of other URL state */
  hrefs: Record<SortOption, string>;
}

/** Sort choices as radio-style links, collapsible like the facets, with the current choice in the header. */
export function SortOptions({ value, hrefs }: SortOptionsProps) {
  return (
    <details className="group/facet">
      <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-medium">
        <span>
          Sort by <span className="font-normal text-muted">· {SORT_OPTIONS[value]}</span>
        </span>
        <ChevronDown className="size-4 text-muted transition-transform group-open/facet:rotate-180" strokeWidth={1.5} />
      </summary>
      <ul role="radiogroup" aria-label="Sort by" className="mt-1 flex flex-col">
        {Object.entries(SORT_OPTIONS).map(([option, label]) => {
          const selected = option === value;
          return (
            <li key={option}>
              <Link
                href={hrefs[option as SortOption]}
                role="radio"
                aria-checked={selected}
                rel="nofollow"
                scroll={false}
                className="group/option flex items-center gap-2.5 py-1.5 text-sm"
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    selected ? "border-foreground" : "border-border group-hover/option:border-foreground"
                  }`}
                >
                  {selected && <span className="size-2 rounded-full bg-foreground" />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
