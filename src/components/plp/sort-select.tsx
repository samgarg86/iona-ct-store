"use client";

import { useRouter } from "next/navigation";

import { SORT_OPTIONS, type SortOption } from "@/lib/types";

interface SortSelectProps {
  value: SortOption;
  /** Precomputed URL per option, so this component needs no knowledge of other URL state */
  hrefs: Record<SortOption, string>;
}

export function SortSelect({ value, hrefs }: SortSelectProps) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort by</span>
      <select
        value={value}
        onChange={(event) => router.push(hrefs[event.target.value as SortOption])}
        className="rounded-md border border-border bg-background px-2 py-1.5"
      >
        {Object.entries(SORT_OPTIONS).map(([option, label]) => (
          <option key={option} value={option}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
