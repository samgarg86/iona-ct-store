import { Search } from "lucide-react";
import Form from "next/form";

import { iconButtonClass } from "@/components/icon-button";

export const MOBILE_SEARCH_ID = "mobile-search";

const inputClass =
  "w-full rounded-full border border-border bg-background py-2 pr-4 pl-10 text-sm outline-hidden placeholder:text-muted focus:border-foreground";

/** Search form submitting to the PLP as `?q=`; `next/form` turns the submit into a client navigation. */
export function SearchForm({ id, autoFocus, className }: { id: string; autoFocus?: boolean; className?: string }) {
  return (
    <Form action="/products" role="search" className={`relative ${className ?? ""}`}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        strokeWidth={1.5}
      />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search products"
        autoFocus={autoFocus}
        className={inputClass}
      />
    </Form>
  );
}

/**
 * Mobile search: an icon button opening a full-width search bar over the header. Like the nav drawer
 * it is a native popover, so the browser handles open state, Escape and light dismiss, and opening
 * it closes the drawer. The input's `autofocus` is honoured each time the popover opens.
 */
export function MobileSearch() {
  return (
    <>
      <button type="button" popoverTarget={MOBILE_SEARCH_ID} className={`${iconButtonClass} lg:hidden`}>
        <span className="sr-only">Search</span>
        <Search className="size-5" strokeWidth={1.5} />
      </button>
      <div
        id={MOBILE_SEARCH_ID}
        popover="auto"
        className="group fixed inset-0 m-0 size-full max-h-none max-w-none border-0 bg-transparent p-0 text-foreground transition-[display,overlay] transition-discrete duration-200 motion-reduce:transition-none lg:hidden"
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          popoverTarget={MOBILE_SEARCH_ID}
          popoverTargetAction="hide"
          className="absolute inset-0 bg-foreground/40 opacity-0 transition-opacity duration-200 group-open:opacity-100 starting:group-open:opacity-0 motion-reduce:transition-none"
        />
        <div className="relative flex h-14 -translate-y-full items-center gap-2 border-b border-border bg-background px-4 shadow-md transition-[translate] duration-200 group-open:translate-y-0 starting:group-open:-translate-y-full motion-reduce:transition-none">
          <SearchForm id="mobile-search-input" autoFocus className="flex-1" />
          <button
            type="button"
            popoverTarget={MOBILE_SEARCH_ID}
            popoverTargetAction="hide"
            className="-mr-2 rounded-md px-2 py-2.5 text-sm font-medium outline-offset-2 hover:bg-surface focus-visible:outline-2 focus-visible:outline-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
